import { PrismaClient } from "@prisma/client";
import fastify from "fastify";
import { z } from "zod";

const app = fastify();

const prisma = new PrismaClient();

app.post("/users", async (request, reply) => {
  const createUserSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    tag: z.string().min(4).max(18),
    curso: z.string(),
    semestre: z.number().min(1).max(10),
  });

  const { name, email, tag, curso, semestre } = createUserSchema.parse(
    request.body
  );

  if (email.endsWith("@catolicasc.edu.br") === false) {
    return reply.status(400).send("Apenas emails CatolicaSC são permitidos");
  }

  await prisma.user.create({
    data: {
      name,
      email,
      tag,
      curso,
      semestre,
    },
  });

  return reply.status(201).send();
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

app
  .listen({
    host: "0.0.0.0",
    port: process.env.PORT ? Number(process.env.PORT) : 3333,
  })
  .then(() => {
    console.log("Server is running");
  });
