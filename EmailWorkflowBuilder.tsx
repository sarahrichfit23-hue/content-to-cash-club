import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import {
  Play, Pause, Save, Plus, Mail, Clock,
  GitBranch, Zap, UserPlus, ShoppingCart,
  UserMinus, Tag, Settings, Trash2, ArrowRight
} from 'lucide-react';
import WorkflowNodeEditor from './workflow/WorkflowNodeEditor';
import WorkflowTemplates from './workflow/WorkflowTemplates';
import WorkflowAnalytics from './workflow/WorkflowAnalytics';

interface WorkflowNode {
  id: string;
  type: string;
  label: string;
  config?: any;
}

const EmailWorkflowBuilder: React.FC = () => {
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [workflowName, setWorkflowName] = useState('New Workflow');
  const [workflowStatus, setWorkflowStatus] = useState<'draft' | 'active' | 'paused'>('draft');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const { toast } = useToast();

  const addNode = (type: string, label: string) => {
    const newNode: WorkflowNode = {
      id: `${type}_${Date.now()}`,
      type,
      label,
      config: {}
    };
    setNodes([...nodes, newNode]);
  };

  const deleteNode = (nodeId: string) => {
    setNodes(nodes.filter(n => n.id !== nodeId));
  };

  const saveWorkflow = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const workflowNodes = nodes.map((node, index) => ({
        ...node,
        position: { x: 100 + index * 200, y: 100 },
        data: { label: node.label, config: node.config }
      }));

      const workflowEdges = nodes.slice(0, -1).map((node, index) => ({
        id: `e${index}`,
        source: node.id,
        target: nodes[index + 1].id
      }));

      const { error } = await supabase
        .from('email_workflows')
        .insert({
          user_id: user.id,
          name: workflowName,
          trigger_type: 'manual',
          status: workflowStatus,
          nodes: workflowNodes,
          edges: workflowEdges
        });

      if (error) throw error;

      toast({
        title: 'Workflow saved',
        description: 'Your workflow has been saved successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'trigger': return <Zap className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'delay': return <Clock className="w-4 h-4" />;
      case 'condition': return <GitBranch className="w-4 h-4" />;
      case 'action': return <Tag className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'trigger': return 'bg-green-500';
      case 'email': return 'bg-blue-500';
      case 'delay': return 'bg-yellow-500';
      case 'condition': return 'bg-purple-500';
      case 'action': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Email Workflow Builder</h2>
          <p className="text-gray-600">Create automated email sequences and triggers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowTemplates(true)}>
            Templates
          </Button>
          <Button variant="outline" onClick={() => setShowAnalytics(true)}>
            Analytics
          </Button>
          <Button onClick={saveWorkflow}>
            <Save className="w-4 h-4 mr-2" />
            Save Workflow
          </Button>
          <Button
            variant={workflowStatus === 'active' ? 'destructive' : 'default'}
            onClick={() => setWorkflowStatus(workflowStatus === 'active' ? 'paused' : 'active')}
          >
            {workflowStatus === 'active' ? (
              <><Pause className="w-4 h-4 mr-2" />Pause</>
            ) : (
              <><Play className="w-4 h-4 mr-2" />Activate</>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Node Palette */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Add Nodes</h3>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => addNode('trigger', 'New Signup')}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Trigger
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => addNode('email', 'Send Email')}
            >
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => addNode('delay', 'Wait')}
            >
              <Clock className="w-4 h-4 mr-2" />
              Delay
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => addNode('condition', 'If/Then')}
            >
              <GitBranch className="w-4 h-4 mr-2" />
              Condition
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => addNode('action', 'Add Tag')}
            >
              <Tag className="w-4 h-4 mr-2" />
              Action
            </Button>
          </div>

          <h3 className="font-semibold mt-6 mb-4">Workflow Templates</h3>
          <div className="space-y-2 text-sm">
            <button className="w-full text-left p-2 hover:bg-gray-100 rounded">
              Welcome Series (5 emails)
            </button>
            <button className="w-full text-left p-2 hover:bg-gray-100 rounded">
              Abandoned Cart (3 emails)
            </button>
            <button className="w-full text-left p-2 hover:bg-gray-100 rounded">
              Re-engagement (4 emails)
            </button>
            <button className="w-full text-left p-2 hover:bg-gray-100 rounded">
              Post-Purchase (2 emails)
            </button>
          </div>
        </Card>

        {/* Workflow Canvas */}
        <div className="lg:col-span-3">
          <Card className="p-6">
            <div className="mb-4">
              <input
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="text-lg font-semibold bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none pb-1"
                placeholder="Workflow name"
              />
            </div>

            {nodes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                <Zap className="w-12 h-12 mb-4" />
                <p className="text-lg font-medium">Start building your workflow</p>
                <p className="text-sm">Add nodes from the palette on the left</p>
              </div>
            ) : (
              <div className="space-y-4">
                {nodes.map((node, index) => (
                  <div key={node.id} className="flex items-center gap-4">
                    <div
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white ${getNodeColor(node.type)} cursor-pointer hover:opacity-90 transition-opacity`}
                      onClick={() => setSelectedNode(node)}
                    >
                      {getNodeIcon(node.type)}
                      <span className="font-medium">{node.label}</span>
                    </div>
                    
                    {index < nodes.length - 1 && (
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNode(node.id)}
                      className="ml-auto"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {nodes.length > 0 && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Status:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    workflowStatus === 'active' ? 'bg-green-100 text-green-700' :
                    workflowStatus === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {workflowStatus}
                  </span>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Nodes:</strong> {nodes.length}
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Node Editor */}
      {selectedNode && (
        <WorkflowNodeEditor
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onSave={(updatedNode) => {
            setNodes(nodes.map(n => n.id === updatedNode.id ? updatedNode : n));
            setSelectedNode(null);
          }}
        />
      )}

      {/* Templates Modal */}
      {showTemplates && (
        <WorkflowTemplates
          onClose={() => setShowTemplates(false)}
          onSelect={(template) => {
            const simpleNodes = template.nodes.map(n => ({
              id: n.id,
              type: n.type,
              label: n.data.label,
              config: n.data.config
            }));
            setNodes(simpleNodes);
            setWorkflowName(template.name);
            setShowTemplates(false);
          }}
        />
      )}

      {/* Analytics Modal */}
      {showAnalytics && (
        <WorkflowAnalytics onClose={() => setShowAnalytics(false)} />
      )}
    </div>
  );
};

export default EmailWorkflowBuilder;