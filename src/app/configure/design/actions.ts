"use server";

import { db } from "@/db";
import {
  CaseColor,
  CaseFinish,
  CaseMaterial,
  PhoneModel,
} from "@prisma/client";

export type CaseConfigArgs = {
  color: CaseColor;
  finish: CaseFinish;
  material: CaseMaterial;
  model: PhoneModel;
  configId: string;
};

export async function saveConfigDetails({
  color,
  finish,
  model,
  material,
  configId,
}: {
  color: CaseColor;
  finish: CaseFinish;
  material: CaseMaterial;
  model: PhoneModel;
  configId: string;
}) {
  const config = await db.configuration.update({
    where: {
      id: configId,
    },
    data: {
      color,
      finish,
      material,
      model,
    },
  });
}
