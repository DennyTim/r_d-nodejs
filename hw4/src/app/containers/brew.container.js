import { asClass, createContainer } from "awilix";
import { dictMap } from "../../utils/dict-map.js";
import { BrewController } from "../controllers/brew.controller.js";
import { BrewService } from "../services/brew.service.js";
import { BrewModel } from "../models/brew.model.js";

/**
 * brewModel - DATA
 * brewService - BUSINESS
 * brewController - HTTP
 * */
const brewModule = {
  brewModel: BrewModel,
  brewService: BrewService,
  brewController: BrewController
};

/**
 * injectionMode: ‘CLASSIC’ означає:
 * Awilix дивиться імена параметрів конструктора і підставляє
 * відповідні реєстраційні токени.
 */
export const brewContainer = createContainer({ injectionMode: "CLASSIC" })
  .register(
    dictMap(brewModule, value => asClass(value)[value.scope]())
  );
