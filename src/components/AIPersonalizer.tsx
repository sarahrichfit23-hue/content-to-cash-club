import React, { useState } from 'react';
import { 
  Sparkles, Copy, Download, Save, RefreshCw, 
  Zap, Heart, Shield, TrendingUp, X 
} from 'lucide-react';
import { BrandDNA, ContentAsset } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';

interface AIPersonalizerProps {
  asset: ContentAsset;
  brandDNA: BrandDNA;
  onClose: () => void;
  onSave: (content: string) => void;
}

const AIPersonalizer: React.FC<AIPersonalizerProps> = ({ 
  asset, 
  brandDNA, 
  onClose, 
  onSave 
}) => {
  const { user } = useAppContext();
  const [versionA, setVersionA] = useState('');
  const [versionB, setVersionB] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeVersion, setActiveVersion] = useState<'A' | 'B'>('A');
  const [customInputs, setCustomInputs] = useState({
    painPoint: brandDNA.coreProblem,
    desiredOutcome: brandDNA.coreOutcome,
    offerAngle: '',
    proofElement: brandDNA.proofElement,
    cta: brandDNA.cta,
    urgency: '',
    platform: brandDNA.platforms[0] || 'IG Reels'
  });

  const generateContent = async (style?: string) => {
    setLoading(true);
    // Simulate AI generation
    setTimeout(() => {
      const generated = `${asset.baseContent}\n\n[Personalized for ${brandDNA.niche}]\n${style ? `Style: ${style}` : ''}`;
      if (activeVersion === 'A') {
        setVersionA(generated);
      } else {
        setVersionB(generated);
      }
      setLoading(false);
    }, 1500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadAsText = (text: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${asset.type}-${Date.now()}.txt`;
    a.click();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Personalizer</h2>
            <p className="text-gray-600">{asset.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-88px)]">
          {/* Left: Base Template */}
          <div className="w-1/3 p-6 border-r border-gray-200 overflow-y-auto">
            <h3 className="font-semibold text-gray-900 mb-4">Base Template</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                {asset.baseContent}
              </pre>
            </div>
          </div>

          {/* Middle: Controls */}
          <div className="w-1/3 p-6 border-r border-gray-200 overflow-y-auto">
            <h3 className="font-semibold text-gray-900 mb-4">Personalization</h3>
            
            {/* Input Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pain Point
                </label>
                <input
                  type="text"
                  value={customInputs.painPoint}
                  onChange={(e) => setCustomInputs({...customInputs, painPoint: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-olive-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Desired Outcome
                </label>
                <input
                  type="text"
                  value={customInputs.desiredOutcome}
                  onChange={(e) => setCustomInputs({...customInputs, desiredOutcome: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-olive-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Call to Action
                </label>
                <input
                  type="text"
                  value={customInputs.cta}
                  onChange={(e) => setCustomInputs({...customInputs, cta: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-olive-600"
                />
              </div>
            </div>

            {/* Style Buttons */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Styles</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => generateContent('Punchier')}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Punchier
                </button>
                <button
                  onClick={() => generateContent('Softer')}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium flex items-center gap-2"
                >
                  <Heart className="w-4 h-4" />
                  Softer
                </button>
                <button
                  onClick={() => generateContent('More Proof')}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  More Proof
                </button>
                <button
                  onClick={() => generateContent('More Benefits')}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium flex items-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  More Benefits
                </button>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={() => generateContent()}
              disabled={loading}
              className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-yellow-600 to-olive-600 text-white font-medium rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate
                </>
              )}
            </button>
          </div>

          {/* Right: Output */}
          <div className="w-1/3 p-6 overflow-y-auto">
            <h3 className="font-semibold text-gray-900 mb-4">Generated Versions</h3>
            
            {/* Version Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveVersion('A')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeVersion === 'A'
                    ? 'bg-olive-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Version A
              </button>
              <button
                onClick={() => setActiveVersion('B')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeVersion === 'B'
                    ? 'bg-olive-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Version B
              </button>
            </div>

            {/* Output Content */}
            <div className="bg-gray-50 rounded-lg p-4 min-h-[200px]">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                {activeVersion === 'A' ? versionA : versionB}
                {!versionA && !versionB && (
                  <span className="text-gray-400">
                    Click "Generate" to create personalized content
                  </span>
                )}
              </pre>
            </div>

            {/* Action Buttons */}
            {(versionA || versionB) && (
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => copyToClipboard(activeVersion === 'A' ? versionA : versionB)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
                <button
                  onClick={() => downloadAsText(activeVersion === 'A' ? versionA : versionB)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={async () => {
                    const content = activeVersion === 'A' ? versionA : versionB;
                    try {
                      // Save to content library
                      const { error } = await supabase
                        .from('content')
                        .insert({
                          user_id: user?.id,
                          title: asset.title,
                          content: content,
                          type: asset.type,
                          metadata: { brandDNA, customInputs }
                        });
                      
                      if (error) throw error;
                      
                      toast({
                        title: 'Content saved to library',
                        description: 'You can find it in My Library tab'
                      });
                      
                      onSave(content);
                    } catch (error: any) {
                      toast({
                        title: 'Error saving content',
                        description: error.message,
                        variant: 'destructive'
                      });
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-olive-600 hover:bg-olive-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save to Library
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default AIPersonalizer;
