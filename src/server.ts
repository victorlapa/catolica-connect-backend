import { PrismaClient } from "@prisma/client";
import fastify, { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
const jwt = require("jsonwebtoken");
const fastifyJwt = require("fastify-jwt");

const app = fastify();

const prisma = new PrismaClient();

app.register(fastifyJwt, {
  secret: process.env.ACCESS_TOKEN_SECRET,
});

const authenticate = async (request: any, reply: any) => {
  try {
    await request.jwtVerify();

    const userId = request.user.userId;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return reply.status(401).send({ error: "User not found" });
    }

    request.user = user;
  } catch (err) {
    reply.status(401).send({ error: "Unauthorized" });
  }
};

app.options("/login", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.send();
});

app.post("/login", async (request, reply) => {
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header("Access-Control-Allow-Methods", "POST");

  const { email, password } = request.body as {
    email: string;
    password: string;
  };

  const user = await prisma.user.findFirst({
    where: {
      email,
      password,
    },
  });

  if (!user) {
    return reply.status(401).send({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "999h",
  });
  reply.send({ token });
});

app.get("/users", { preHandler: [authenticate] }, async (request, reply) => {
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header("Access-Control-Allow-Methods", "GET");
  const users = await prisma.user.findMany();

  return { users };
});

app.get("/users/:id", async (request, reply) => {
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header("Access-Control-Allow-Methods", "GET");

  const { id } = request.params as { id: string };

  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
    include: {
      posts: true,
    },
  });

  return { user };
});

app.put("/users/:id", { preHandler: [authenticate] }, async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "*");

  const { id } = req.params as { id: string };

  const userExists = await prisma.user.findFirst({
    where: {
      id: id,
    },
  });

  if (!userExists) return res.status(400).send("Usuário não existe");

  const updateUserSchema = z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    tag: z.string().min(4).max(18).optional(),
    curso: z.string().optional(),
    periodo: z.number().min(1).max(10).optional(),
    description: z.string().max(60).optional(),
    password: z.string().min(8).max(16).optional(),
    profileImgUrl: z.string().optional(),
  });

  const {
    name,
    email,
    tag,
    curso,
    periodo,
    description,
    password,
    profileImgUrl,
  } = updateUserSchema.parse(req.body);

  await prisma.user.update({
    where: {
      id: id,
    },
    data: {
      name,
      email,
      tag,
      curso,
      periodo,
      description,
      password,
      profileImgUrl,
    },
  });

  return res.status(200).send({ message: "Usuário atualizado com sucesso" });
});

app.options("/users", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.send();
});

app.post("/users", async (request, reply) => {
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header("Access-Control-Allow-Methods", "POST");

  const createUserSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    tag: z.string().min(4).max(18),
    curso: z.string(),
    periodo: z.number().min(1).max(10),
    description: z.string().max(60).optional(),
    password: z.string().min(8).max(16),
  });

  const { name, email, tag, curso, periodo, description, password } =
    createUserSchema.parse(request.body);

  if (!email.endsWith("@catolicasc.edu.br")) {
    return reply.status(400).send("Apenas emails CatolicaSC são permitidos");
  }

  await prisma.user.create({
    data: {
      name,
      email,
      tag,
      curso,
      periodo,
      description,
      password,
    },
  });

  return reply.status(201).send();
});

app.delete("/users", async (request, reply) => {
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header("Access-Control-Allow-Methods", "DELETE");

  const { id } = request.query as { id: string };

  const userExists = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });

  if (!userExists) {
    return reply.status(400).send("Usuário não existe");
  }

  await prisma.user.delete({
    where: {
      id: id,
    },
  });

  return reply.status(201);
});

app.get("/posts", async (request, reply) => {
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header("Access-Control-Allow-Methods", "GET");

  const posts = await prisma.post.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      author: {
        select: {
          name: true,
          tag: true,
          curso: true,
          periodo: true,
          description: true,
          profileImgUrl: true,
        },
      },
    },
  });

  return { posts };
});

app.options("/posts", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.send();
});

app.post("/posts", async (request, reply) => {
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header("Access-Control-Allow-Methods", "POST");
  reply.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  const createPostSchema = z.object({
    content: z.string().min(1).max(120),
    authorId: z.string(),
    likes: z.number().default(0),
    imageUrl: z.string().optional(),
  });

  const { content, authorId, likes } = createPostSchema.parse(request.body);

  await prisma.post.create({
    data: {
      content,
      authorId,
      likes,
    },
  });

  return reply.status(201).send();
});

app.get("/groups", async (request, reply) => {
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header("Access-Control-Allow-Methods", "GET");

  const groups = await prisma.group.findMany();

  return { groups };
});

app.post("/groups", async (request, reply) => {
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header("Access-Control-Allow-Methods", "POST");

  const createGroupSchema = z.object({
    name: z.string().min(2).max(120),
    description: z.string().optional(),
    createdBy: z.string().cuid(),
  });

  const { name, createdBy, description } = createGroupSchema.parse(
    request.body
  );

  await prisma.group.create({
    data: {
      createdBy,
      name,
      description,
    },
  });

  return reply.status(201).send();
});

app.delete("/groups/:id", async (request, reply) => {
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header("Access-Control-Allow-Methods", "DELETE");

  const { id } = request.query as { id: number };

  const groupExists = await prisma.group.findUnique({
    where: {
      id: id,
    },
  });

  if (!groupExists) {
    return reply.status(400).send("Grupo não existe");
  }

  await prisma.group.delete({
    where: {
      id: id,
    },
  });

  return reply.status(201);
});

app
  .listen({
    host: "0.0.0.0",
    port: process.env.PORT ? Number(process.env.PORT) : 3333,
  })
  .then(() => {
    console.log("Server is running");
  });
