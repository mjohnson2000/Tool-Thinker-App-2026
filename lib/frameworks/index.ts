import { JTBD } from "./jtbd"
import { ValueProp } from "./valueProp"
import { BusinessModel } from "./businessModel"
import type { Framework } from "@/types/frameworks"

export const FRAMEWORKS: Record<string, Framework> = {
  jtbd: JTBD,
  value_prop: ValueProp,
  business_model: BusinessModel,
}

export const FRAMEWORK_ORDER = [
  "jtbd",
  "value_prop",
  "business_model",
] as const

export function getFramework(key: string): Framework | undefined {
  return FRAMEWORKS[key]
}

export function getNextStep(currentStep: string): string | null {
  const index = FRAMEWORK_ORDER.indexOf(currentStep as any)
  if (index === -1 || index === FRAMEWORK_ORDER.length - 1) {
    return null
  }
  return FRAMEWORK_ORDER[index + 1]
}

export function getPreviousStep(currentStep: string): string | null {
  const index = FRAMEWORK_ORDER.indexOf(currentStep as any)
  if (index <= 0) {
    return null
  }
  return FRAMEWORK_ORDER[index - 1]
}




