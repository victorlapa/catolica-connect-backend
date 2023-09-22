import { PrismaClient } from "@prisma/client";
import fastify from "fastify";
import { z } from "zod";

const app = fastify();

const prisma = new PrismaClient();

app.get("/users", async () => {
  const users = await prisma.user.findMany();

  return { users };
});

app.get("/users/:id", async (request, reply) => {
  const { id } = request.query as { id: string };

  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });

  return { user };
});

app.post("/users", async (request, reply) => {
  const createUserSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    tag: z.string().min(4).max(18),
    curso: z.string(),
    periodo: z.number().min(1).max(10),
    description: z.string().max(60).optional(),
  });

  const { name, email, tag, curso, periodo, description } =
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
    },
  });

  return reply.status(201).send();
});

app.delete("/users", async (request, reply) => {
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

app.get("/posts", async () => {
  const posts = await prisma.post.findMany();

  return { posts };
});

app.post("/posts", async (request, reply) => {
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

app.get("/groups", async () => {
  const groups = await prisma.group.findMany();

  return { groups };
});

app.post("/groups", async (request, reply) => {
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
