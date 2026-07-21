import { useSupplyChain } from "../supply-chain/supply-chain.queries";
import { GitMerge, GitBranch, ArrowDown, AlertCircle } from "lucide-react";
import type { SupplyChainNode } from "../supply-chain/supply-chain.types";

interface BatchLineageTabProps {
  batchId: string;
}

export function BatchLineageTab({ batchId }: BatchLineageTabProps) {
  const { data, isLoading, isError } = useSupplyChain(batchId);
  const nodes = data?.data ?? [];

  if (isLoading) {
    return <div className="text-gray-500 py-8 text-center">Loading lineage tree...</div>;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-red-500">
        <AlertCircle className="w-8 h-8" />
        <p>Failed to load lineage data.</p>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
        <GitBranch className="w-12 h-12 text-gray-300 mb-3" />
        <p className="text-gray-500 font-medium">No lineage history available</p>
        <p className="text-gray-400 text-sm mt-1">This batch has not been split or merged.</p>
      </div>
    );
  }

  // Very simplified recursive renderer for lineage tree nodes
  const renderNode = (node: SupplyChainNode, isRoot = false) => {
    return (
      <div key={node.id} className="flex flex-col items-center">
        <div 
          className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm w-64 text-center hover:border-green-400 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            {node.role.includes("SPLIT") ? (
              <GitBranch className="w-4 h-4 text-blue-500" />
            ) : node.role.includes("MERGE") ? (
              <GitMerge className="w-4 h-4 text-purple-500" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-green-500" />
            )}
            <span className="text-xs font-bold text-gray-700">{node.name}</span>
          </div>
          <code className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{node.id}</code>
          <div className="text-[10px] text-gray-400 mt-2">{node.date}</div>
        </div>
        
        {node.children && node.children.length > 0 && (
          <>
            <ArrowDown className="w-4 h-4 text-gray-300 my-2" />
            <div className="flex gap-4 items-start">
              {node.children.map(child => renderNode(child))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-50/50 rounded-2xl p-8 border border-gray-100 overflow-x-auto">
      <div className="min-w-max flex flex-col items-center">
        {nodes.map(rootNode => renderNode(rootNode, true))}
      </div>
    </div>
  );
}
