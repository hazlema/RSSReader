import React, { useState } from 'react';
import { X, Send, Wand2, ExternalLink } from 'lucide-react';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: any;
  reactions: any[];
  isDarkMode: boolean;
  onPublish: (storyId: number, reactionText: string) => void;
  onToggleVisibility: (uid: number, visible: boolean) => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  story,
  reactions,
  isDarkMode,
  onPublish,
  onToggleVisibility
}) => {
  const [selectedReaction, setSelectedReaction] = useState('');
  const [reactionText, setReactionText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen || !story) return null;

  const handleReactionChange = (reactionUid: string) => {
    setSelectedReaction(reactionUid);
    
    if (reactionUid) {
      // Find the selected reaction
      const reaction = reactions.find(r => r.uid.toString() === reactionUid);
      if (reaction) {
        // Execute generateReaction function with story object and reaction prompt
        generateReaction(story, reaction.prompt);
      }
    }
  };

  // Placeholder generateReaction function - replace with your actual implementation
  const generateReaction = (storyObject: any, reactionPrompt: string) => {
    console.log('GenerateReaction function called with:');
    console.log('Story:', storyObject);
    console.log('Reaction Prompt:', reactionPrompt);
    
    // TODO: Implement your generateReaction function logic here
    // This might involve API calls, text processing, etc.
  };

  // Placeholder publish function - replace with your actual implementation
  const publishStoryWithReaction = (storyObject: any, generatedReactionText: string) => {
    console.log('PublishStoryWithReaction function called with:');
    console.log('Story:', storyObject);
    console.log('Generated Reaction Text:', generatedReactionText);
    
    // TODO: Implement your actual publish logic here
    // This might involve:
    // - Sending to social media APIs
    // - Saving to database
    // - Posting to content management systems
    // - etc.
  };

  const handleGenerate = async () => {
    if (!selectedReaction) return;
    
    setIsGenerating(true);
    
    // Find the selected reaction prompt
    const reaction = reactions.find(r => r.uid.toString() === selectedReaction);
    if (!reaction) {
      setIsGenerating(false);
      return;
    }

    // Replace [{story}] placeholder with actual story title
    const processedPrompt = reaction.prompt.replace(/\[{story}\]/g, story.title);
    
    // For now, just populate the text area with the processed prompt
    setTimeout(() => {
      setReactionText(processedPrompt);
      setIsGenerating(false);
    }, 500);
  };

  const handlePublish = () => {
    // Check if reaction text has been generated/populated
    if (!reactionText.trim()) {
      alert('Error: Please generate a reaction text before publishing.');
      return;
    }
    
    // Call the placeholder publish function
    publishStoryWithReaction(story, reactionText);
    
    // Call the parent component's publish handler
    onPublish(story.UID, reactionText);
    
    // Close modal and reset form
    onClose();
    setSelectedReaction('');
    setReactionText('');
  };

  const handleCancel = () => {
    onClose();
    // Reset form
    setSelectedReaction('');
    setReactionText('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-600" style={{ backgroundColor: '#111' }}>
        <div className={`flex items-center justify-between p-6 border-b ${
          'border-gray-700'
        }`}>
          <h2 className="text-xl font-semibold text-white">
            Publish Story
          </h2>
          <button
            onClick={handleCancel}
            className="transition-colors text-gray-400 hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {/* Article Title */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-white">
              {story.title}
            </h3>
            <div className="mt-2">
              <a
                href={story.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:underline flex items-center text-blue-400"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Read full article
              </a>
            </div>
          </div>

          {/* Reaction Text Area */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Reaction Text
            </label>
            <textarea
              value={reactionText}
              readOnly
              placeholder="Generated reaction text will appear here..."
              className="w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              style={{ height: '250px' }}
            />
          </div>

          {/* Reaction Dropdown and Generate Button */}
          <div className="mb-6 flex items-end space-x-3">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Reaction Type
              </label>
              <select
                value={selectedReaction}
                onChange={(e) => handleReactionChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Reaction Type</option>
                {reactions.map((reaction) => (
                  <option key={reaction.uid} value={reaction.uid}>
                    {reaction.type}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleGenerate}
              disabled={!selectedReaction || isGenerating}
              className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !selectedReaction || isGenerating
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin w-4 h-4 mr-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  </div>
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate
                </>
              )}
            </button>
          </div>

          <br />

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-600 text-gray-300 hover:bg-gray-800 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePublish}
              disabled={!reactionText.trim()}
              className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !reactionText.trim()
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              <Send className="w-4 h-4 mr-2" />
              Publish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};