import type { LinkInfoData } from '../types';
import { ArrowRight, Info, ExternalLink } from 'lucide-react';

interface PathInfoProps {
  path: string[];
  linkInfo: LinkInfoData[];
}

export function PathInfo({ path, linkInfo }: PathInfoProps) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
      <h3 className="text-xl font-semibold text-gray-100 mb-4 flex items-center gap-2">
        <Info className="w-5 h-5 text-blue-400" />
        Path Details
      </h3>
      
      {path.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          <p className="text-sm">No path found yet</p>
          <p className="text-xs mt-2">Search for a path to see details here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {path.map((node, index) => {
            const isLast = index === path.length - 1;
            const linkInfoForStep = linkInfo.find(li => li.step === index + 1);
            
            return (
              <div key={`${node}-${index}`} className="space-y-2">
                {/* Node */}
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-100 font-medium">{node}</div>
                  </div>
                </div>
                
                {/* Connection Info */}
                {!isLast && linkInfoForStep && (
                  <div className="ml-11 pl-4 border-l-2 border-gray-700">
                    <div className="flex items-start gap-2 text-sm text-gray-400">
                      <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-gray-300 mb-1">
                          <span className="font-medium">{linkInfoForStep.from}</span>
                          {' → '}
                          <span className="font-medium">{linkInfoForStep.to}</span>
                        </div>
                        <div className="text-gray-400 italic mb-2">
                          {linkInfoForStep.excerpt}
                        </div>
                        {linkInfoForStep.source_url && (
                          <a
                            href={linkInfoForStep.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>View on Wikipedia</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Arrow between nodes */}
                {!isLast && (
                  <div className="ml-11 flex items-center">
                    <div className="h-6 w-0.5 bg-gray-700" />
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Show loading message if path found but link info still loading */}
          {path.length > 1 && linkInfo.length < path.length - 1 && (
            <div className="mt-4 text-sm text-gray-500 italic">
              Loading connection details...
            </div>
          )}
        </div>
      )}
    </div>
  );
}

