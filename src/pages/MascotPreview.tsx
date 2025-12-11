import Mascot from "@/components/Mascot";

const MascotPreview = () => {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center overflow-hidden p-4">
            <h1 className="text-white mb-12 text-3xl font-bold font-display tracking-wider">Mascot Preview</h1>

            <div className="scale-75 md:scale-100 transition-transform duration-300">
                <Mascot />
            </div>

            <p className="text-white/40 mt-12 text-sm font-mono animate-pulse">
                Clique na mascote para interagir
            </p>
        </div>
    );
};

export default MascotPreview;
