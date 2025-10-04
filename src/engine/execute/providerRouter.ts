import type { GPTPDocument, GPTPParams } from '@/types/gptpTypes'
import { callOpenAI } from '@/providers/openai/openaiRunner'
import { callMicrosoftAzureOpenAI } from '@/providers/microsoft/microsoftAzureOpenaiRunner'
import { callAnthropic } from '@/providers/anthropic/anthropicRunner'
import { callMistral } from '@/providers/mistral/mistralRunner'
import { callCohere } from '@/providers/cohere/cohereRunner'
import { callMetaLlama } from '@/providers/meta/metaLlamaRunner'
import { callLocal } from '@/providers/local/localRunner'

export type ProviderType = 'openai' | 'microsoft' | 'anthropic' | 'mistral' | 'cohere' | 'meta' | 'local'

export interface ProviderSelection {
  name: string
  type: ProviderType
  call: (opts: {
    messages: { role: string; content: string }[]
    model: string
    temperature: number
    top_p: number
    max_tokens: number
    signal?: AbortSignal
  }) => Promise<any>
}

export function selectProvider(prompt: GPTPDocument): ProviderSelection {
  const providers = prompt.connections?.providers || {}
  const active = prompt.connections?.active
  let name = active && providers[active] ? active : undefined

  if (!name) {
    // default to openai if not configured
    return { name: 'openai', type: 'openai', call: callOpenAI }
  }

  const cfg = providers[name]
  const type = (cfg.type || name) as ProviderType

  switch (type) {
    case 'openai':
      return { name, type: 'openai', call: callOpenAI }
    case 'microsoft':
      return { name, type: 'microsoft', call: callMicrosoftAzureOpenAI as any }
    case 'anthropic':
      return { name, type: 'anthropic', call: callAnthropic as any }
    case 'mistral':
      return { name, type: 'mistral', call: callMistral as any }
    case 'cohere':
      return { name, type: 'cohere', call: callCohere as any }
    case 'meta':
      return { name, type: 'meta', call: callMetaLlama as any }
    case 'local':
      return { name, type: 'local', call: callLocal as any }
    default:
      return { name, type: 'openai', call: callOpenAI }
  }
}

export function mapParams(params?: GPTPParams): Required<Pick<GPTPParams, 'model' | 'temperature' | 'top_p' | 'max_tokens'>> {
  return {
    model: params?.model || 'gpt-4',
    temperature: params?.temperature ?? 0.7,
    top_p: params?.top_p ?? 1,
    max_tokens: params?.max_tokens ?? 512,
  }
}
