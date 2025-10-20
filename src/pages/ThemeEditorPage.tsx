import LiveThemeEditor from "@/components/WorkingThemeSystem";
import { FadeInUp } from "@/components/PremiumAnimations";

const ThemeEditorPage = () => {
    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
                <FadeInUp>
                    <LiveThemeEditor />
                </FadeInUp>
            </div>
        </div>
    );
};

export default ThemeEditorPage;