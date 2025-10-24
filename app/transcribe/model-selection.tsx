import { SupportedModels } from '@/lib/transcribe-models';


export default function ModelSelection({ onModelSelect, selectedModel }: { onModelSelect: (model: string) => void, selectedModel: string }) {
    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Select Transcription Model
            </h3>
            <div className="space-y-4">
                <div>
                    <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
                        Model
                    </label>
                    <select
                        id="model"
                        value={selectedModel}
                        onChange={(e) => onModelSelect(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                        {SupportedModels.map((model) => (
                            <option key={model} value={model}>
                                {model}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}
