import { Router } from "express";
import { makeClassInvoker } from "awilix-express";
import { z } from "zod";
import rateLimit from "express-rate-limit";

import { BrewController } from "../controllers/brew.controller.js";
import { BrewDTO } from "../dto/brew.dto.js";
import { validateParams } from "../middlewares/validate-params.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../middlewares/async-handler.middleware.js";
import { validateQueryParams } from "../middlewares/validate-query-params.middleware.js";

const brewRouter = Router();
const ctl = makeClassInvoker(BrewController);

const getByIdSchema = z.object({
  id: z.string().describe("Brew ID")
});

const getAllByParamsSchema = z.object({
  method: z.enum(["v60", "aeropress", "chemex", "espresso"]).optional(),
  ratingMin: z
    .string()
    .transform(val => parseInt(val))
    .refine(val => !isNaN(val), {
      message: "ratingMin must be a number"
    })
    .refine(val => val >= 1 && val <= 5, {
      message: "ratingMin must be in range from 1 to 5"
    })
    .optional()
});

brewRouter.get(
  "/brews",
  validateQueryParams(getAllByParamsSchema),
  ctl("index")
);
registry.registerPath({
  method: "get",
  path: "/api/brews",
  tags: ["Brews"],
  request: {
    query: getAllByParamsSchema
  },
  responses: {
    200: {
      description: "Array of brews",
      content: {
        "application/json": {
          schema: z.array(BrewDTO)
        }
      }
    }
  }
});

brewRouter.get(
  "/brews/:id",
  validateParams(getByIdSchema),
  ctl("show")
);
registry.registerPath({
  method: "get",
  path: "/api/brews/{id}",
  tags: ["Brews"],
  request: {
    params: getByIdSchema
  },
  responses: {
    200: {
      description: "Brew",
      content: {
        "application/json": { schema: BrewDTO }
      }
    },
    404: { description: "Brew not found" }
  }
});

brewRouter.post(
  "/brews",
  rateLimit({
    windowMs: 60_000,
    max: 10,
    standardHeaders: true,     // RateLimit-* для клієнта
    legacyHeaders: false
  }),
  validate(BrewDTO),
  asyncHandler(ctl("create"))
);
registry.registerPath({
  method: "post",
  path: "/api/brews",
  tags: ["Brews"],
  request: {
    body: {
      required: true,
      content: {
        "application/json": { schema: BrewDTO }
      }
    }
  },
  responses: {
    201: {
      description: "Created",
      content: {
        "application/json": { schema: BrewDTO }
      }
    },
    400: { description: "Validation error" }
  }
});

brewRouter.put(
  "/brews/:id",
  validateParams(getByIdSchema),
  validate(BrewDTO),
  asyncHandler(ctl("update"))
);
registry.registerPath({
  method: "put",
  path: "/api/brews/{id}",
  tags: ["Brews"],
  request: {
    params: getByIdSchema,
    body: {
      required: true,
      content: {
        "application/json": { schema: BrewDTO }
      }
    }
  },
  responses: {
    200: {
      description: "Updated brew",
      content: { "application/json": { schema: BrewDTO } }
    },
    400: { description: "Validation error" },
    404: { description: "Brew not found" }
  }
});

brewRouter.delete(
  "/brews/:id",
  asyncHandler(ctl("remove"))
);
registry.registerPath({
  method: "delete",
  path: "/api/brews/{id}",
  tags: ["Brews"],
  request: { params: getByIdSchema },
  responses: {
    204: { description: "Deleted" },
    404: { description: "Brew not found" }
  }
});

export default brewRouter;
