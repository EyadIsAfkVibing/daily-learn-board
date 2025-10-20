import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const THEME_STORAGE_KEY = "active-theme";

interface CustomTheme {
    primary: string;
    accent: string;
    success: string;
}

const PRESET_THEMES = [
    { name: "Purple Dream", theme: { primary: "#8b5cf6", accent: "#a78bfa", success: "#10b981" } },
    { name: "Ocean Blue", theme: { primary: "#3b82f6", accent: "#60a5fa", success: "#06b6d4" } },
    { name: "Cyberpunk Pink", theme: { primary: "#ec4899", accent: "#f472b6", success: "#f59e0b" } },
    { name: "Matrix Green", theme: { primary: "#10b981", accent: "#34d399", success: "#22c55e" } },
    { name: "Sunset Orange", theme: { primary: "#f97316", accent: "#fb923c", success: "#eab308" } },
    { name: "Royal Purple", theme: { primary: "#6366f1", accent: "#818cf8", success: "#8b5cf6" } },
    { name: "Crimson Red", theme: { primary: "#ef4444", accent: "#f87171", success: "#fb923c" } },
    { name: "Teal Wave", theme: { primary: "#14b8a6", accent: "#2dd4bf", success: "#10b981" } },
];

const WorkingThemeSystem = () => {
    const [customTheme, setCustomTheme] = useState<CustomTheme>({
        primary: "#8b5cf6",
        accent: "#a78bfa",
        success: "#10b981",
    });

    useEffect(() => {
        const saved = localStorage.getItem(THEME_STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setCustomTheme(parsed);
                applyTheme(parsed);
            } catch (e) {
                console.error("Failed to load theme", e);
            }
        }
    }, []);

    const applyTheme = (theme: CustomTheme) => {
        // Create a style tag with CSS variables
        let styleTag = document.getElementById('theme-styles');
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'theme-styles';
            document.head.appendChild(styleTag);
        }

        styleTag.textContent = `
      :root {
        --primary: ${hexToHSL(theme.primary)};
        --accent: ${hexToHSL(theme.accent)};
        --success: ${hexToHSL(theme.success)};
      }

      /* Apply colors to elements */
      .text-primary {
        color: ${theme.primary} !important;
      }

      .text-accent {
        color: ${theme.accent} !important;
      }

      .text-success {
        color: ${theme.success} !important;
      }

      .bg-primary {
        background-color: ${theme.primary} !important;
      }

      .bg-accent {
        background-color: ${theme.accent} !important;
      }

      .bg-success {
        background-color: ${theme.success} !important;
      }

      .border-primary {
        border-color: ${theme.primary} !important;
      }

      .border-accent {
        border-color: ${theme.accent} !important;
      }

      /* Glow effects with theme colors */
      .glow {
        box-shadow: 0 0 20px ${theme.primary}80,
                    0 0 40px ${theme.primary}4D,
                    0 0 60px ${theme.primary}33 !important;
      }

      .glow-accent {
        box-shadow: 0 0 20px ${theme.accent}99,
                    0 0 40px ${theme.accent}66,
                    0 0 60px ${theme.accent}33 !important;
      }

      .neon-text {
        text-shadow: 0 0 10px ${theme.primary}CC,
                     0 0 20px ${theme.primary}99,
                     0 0 30px ${theme.primary}66,
                     0 0 40px ${theme.primary}33 !important;
      }

      .premium-button {
        background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%) !important;
        box-shadow: 0 10px 30px ${theme.primary}66 !important;
      }

      .premium-button:hover {
        box-shadow: 0 15px 40px ${theme.primary}99 !important;
      }

      .ring-accent {
        --tw-ring-color: ${theme.accent} !important;
      }

      .ring-primary {
        --tw-ring-color: ${theme.primary} !important;
      }
    `;

        localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
    };

    const hexToHSL = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) return "0 0% 50%";

        let r = parseInt(result[1], 16) / 255;
        let g = parseInt(result[2], 16) / 255;
        let b = parseInt(result[3], 16) / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }

        return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    const handleColorChange = (key: keyof CustomTheme, value: string) => {
        const newTheme = { ...customTheme, [key]: value };
        setCustomTheme(newTheme);
        applyTheme(newTheme);
    };

    const applyPreset = (preset: typeof PRESET_THEMES[0]) => {
        setCustomTheme(preset.theme);
        applyTheme(preset.theme);
        toast.success(`${preset.name} theme applied! 🎨`);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-primary mb-2 neon-text">🎨 Theme Customizer</h2>
                <p className="text-muted-foreground">Choose a preset or create your own colors</p>
            </div>

            {/* Presets */}
            <div>
                <h3 className="text-xl font-bold text-primary mb-4">Quick Themes</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {PRESET_THEMES.map((preset, idx) => (
                        <motion.button
                            key={preset.name}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => applyPreset(preset)}
                            className="premium-card glass p-4 rounded-xl"
                        >
                            <div className="flex gap-1 mb-2">
                                <div className="w-full h-12 rounded" style={{ background: preset.theme.primary }} />
                                <div className="w-full h-12 rounded" style={{ background: preset.theme.accent }} />
                                <div className="w-full h-12 rounded" style={{ background: preset.theme.success }} />
                            </div>
                            <p className="text-xs font-semibold">{preset.name}</p>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Custom Colors */}
            <Card className="glass-strong p-6 luxury-shadow">
                <h3 className="text-xl font-bold text-primary mb-6">Custom Colors</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold">Primary Color</Label>
                        <div className="flex gap-3">
                            <Input
                                type="color"
                                value={customTheme.primary}
                                onChange={(e) => handleColorChange("primary", e.target.value)}
                                className="w-20 h-12 cursor-pointer"
                            />
                            <Input
                                type="text"
                                value={customTheme.primary}
                                onChange={(e) => handleColorChange("primary", e.target.value)}
                                className="glass flex-1"
                            />
                        </div>
                        <div className="p-4 rounded-lg" style={{ background: customTheme.primary, boxShadow: `0 0 30px ${customTheme.primary}80` }}>
                            <p className="text-white font-bold">Primary Color</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-sm font-semibold">Accent Color</Label>
                        <div className="flex gap-3">
                            <Input
                                type="color"
                                value={customTheme.accent}
                                onChange={(e) => handleColorChange("accent", e.target.value)}
                                className="w-20 h-12 cursor-pointer"
                            />
                            <Input
                                type="text"
                                value={customTheme.accent}
                                onChange={(e) => handleColorChange("accent", e.target.value)}
                                className="glass flex-1"
                            />
                        </div>
                        <div className="p-4 rounded-lg" style={{ background: customTheme.accent, boxShadow: `0 0 30px ${customTheme.accent}80` }}>
                            <p className="text-white font-bold">Accent Color</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-sm font-semibold">Success Color</Label>
                        <div className="flex gap-3">
                            <Input
                                type="color"
                                value={customTheme.success}
                                onChange={(e) => handleColorChange("success", e.target.value)}
                                className="w-20 h-12 cursor-pointer"
                            />
                            <Input
                                type="text"
                                value={customTheme.success}
                                onChange={(e) => handleColorChange("success", e.target.value)}
                                className="glass flex-1"
                            />
                        </div>
                        <div className="p-4 rounded-lg" style={{ background: customTheme.success, boxShadow: `0 0 30px ${customTheme.success}80` }}>
                            <p className="text-white font-bold">Success Color</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Live Preview */}
            <Card className="glass-strong p-8 luxury-shadow">
                <h3 className="text-2xl font-bold text-primary mb-6">Live Preview</h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <Card className="glass p-4 premium-card">
                            <h4 className="font-bold text-primary mb-2">Primary Card</h4>
                            <p className="text-sm">Sample text content</p>
                        </Card>
                        <Card className="glass p-4 premium-card">
                            <h4 className="font-bold text-accent mb-2">Accent Card</h4>
                            <p className="text-sm">Sample text content</p>
                        </Card>
                        <Card className="glass p-4 premium-card">
                            <h4 className="font-bold text-success mb-2">Success Card</h4>
                            <p className="text-sm">Sample text content</p>
                        </Card>
                    </div>
                    <div className="flex gap-3">
                        <Button className="premium-button flex-1">Primary Button</Button>
                        <Button className="premium-button flex-1" style={{ background: `linear-gradient(135deg, ${customTheme.accent}, ${customTheme.success})` }}>
                            Accent Button
                        </Button>
                    </div>
                    <h2 className="text-3xl font-bold neon-text text-primary">Neon Glow Text Effect</h2>
                </div>
            </Card>
        </div>
    );
};

export default WorkingThemeSystem;