import React, { useState } from 'react'
import { AvatarPreview } from './AvatarPreview'
import { AvatarConfig, DEFAULT_AVATAR_CONFIG } from '@/utils/generateAvatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { motion } from 'framer-motion'
import { RefreshCw, Save, RotateCcw } from 'lucide-react'

interface AvatarEditorProps {
  initialConfig?: AvatarConfig
  onSave: (config: AvatarConfig) => Promise<void>
  username: string
}

const STYLES = ['adventurer', 'avataaars', 'bottts', 'pixel-art', 'big-smile', 'croodles']
const _HAIR_TYPES = ['long', 'short', 'bob', 'curly', 'buzz', 'none']
const _EYE_TYPES = ['default', 'happy', 'wink', 'surprised', 'closed']
const _MOUTH_TYPES = ['default', 'smile', 'tongue', 'sad', 'open']

export const AvatarEditor: React.FC<AvatarEditorProps> = ({ initialConfig, onSave, username }) => {
  const [config, setConfig] = useState<AvatarConfig>(
    initialConfig || ({ ...DEFAULT_AVATAR_CONFIG, seed: username } as AvatarConfig)
  )
  const [loading, setLoading] = useState(false)

  const updateConfig = (updates: Partial<AvatarConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }))
  }

  const handleRandomize = () => {
    updateConfig({ seed: Math.random().toString(36).substring(7) })
  }

  const handleReset = () => {
    setConfig({ ...DEFAULT_AVATAR_CONFIG, seed: username } as AvatarConfig)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await onSave(config)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 rounded-3xl border border-white/10 bg-card/30 p-6 shadow-2xl backdrop-blur-xl md:grid-cols-2">
      {/* Preview Section */}
      <div className="flex flex-col items-center justify-center space-y-6 rounded-2xl border border-white/5 bg-black/20 p-8">
        <motion.div
          key={config.seed + config.style}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <AvatarPreview
            config={config}
            size={240}
            className="shadow-[0_0_50px_rgba(var(--primary),0.15)]"
          />
        </motion.div>

        <div className="flex w-full max-w-xs gap-3">
          <Button
            variant="outline"
            onClick={handleRandomize}
            className="h-11 flex-1 border-white/10 bg-white/5 font-mono text-[10px] uppercase tracking-wider hover:bg-white/10"
          >
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Randomize
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            className="h-11 border-white/10 bg-white/5 hover:bg-white/10"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Editor Section */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="font-mono text-xl font-black uppercase tracking-tight">Custom_Identity</h3>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Avatar Terminal Configuration
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1.5">
            <Label className="ml-1 font-mono text-[9px] font-bold uppercase text-white/40">
              Style_Protocol
            </Label>
            <Select
              onValueChange={(val) => updateConfig({ style: val })}
              defaultValue={config.style}
            >
              <SelectTrigger className="h-11 rounded-xl border-white/10 bg-black/40 font-mono text-xs">
                <SelectValue placeholder="Select Style" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-zinc-900 font-mono text-white">
                {STYLES.map((s) => (
                  <SelectItem key={s} value={s} className="text-[10px] uppercase">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="ml-1 font-mono text-[9px] font-bold uppercase text-white/40">
              Identity_Seed
            </Label>
            <Input
              value={config.seed}
              onChange={(e) => updateConfig({ seed: e.target.value })}
              className="h-11 rounded-xl border-white/10 bg-black/40 font-mono text-xs placeholder:text-white/10"
              placeholder="Unique identifier..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="ml-1 font-mono text-[9px] font-bold uppercase text-white/40">
                Base_Hue
              </Label>
              <Input
                type="color"
                value={config.backgroundColor ? `#${config.backgroundColor}` : '#b6e3f4'}
                onChange={(e) => updateConfig({ backgroundColor: e.target.value })}
                className="h-11 overflow-hidden rounded-xl border-white/10 bg-black/40 p-1"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="ml-1 font-mono text-[9px] font-bold uppercase text-white/40">
                Scale_Factor
              </Label>
              <Input
                type="number"
                min="50"
                max="150"
                value={config.scale || 100}
                onChange={(e) => updateConfig({ scale: parseInt(e.target.value) })}
                className="h-11 rounded-xl border-white/10 bg-black/40 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={loading}
          className="h-12 w-full rounded-xl bg-primary font-mono font-black uppercase tracking-widest text-primary-foreground shadow-[0_0_30px_rgba(var(--primary),0.2)] transition-all duration-300 hover:shadow-[0_0_40px_rgba(var(--primary),0.3)]"
        >
          {loading ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Update_Core_Identity
        </Button>
      </div>
    </div>
  )
}
