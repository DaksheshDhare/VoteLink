import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  Eye, 
  Upload, 
  Download,
  Move,
  Palette,
  Layout,
  Image,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Copy,
  RotateCw
} from 'lucide-react';

interface Party {
  id: string;
  name: string;
  symbol: string;
  color: string;
  symbolImage?: string;
}

interface Candidate {
  id: string;
  name: string;
  partyId: string;
  photo?: string;
  position: number;
}

interface BallotLayout {
  id: string;
  title: string;
  electionType: 'national' | 'state' | 'district' | 'local';
  layout: 'grid' | 'list' | 'circular';
  columns: number;
  headerConfig: {
    showTitle: boolean;
    showInstructions: boolean;
    showSymbols: boolean;
    fontSize: 'small' | 'medium' | 'large';
    alignment: 'left' | 'center' | 'right';
  };
  candidates: Candidate[];
  backgroundColor: string;
  borderStyle: 'none' | 'solid' | 'dotted' | 'dashed';
  created: string;
  lastModified: string;
}

export const BallotDesigner: React.FC = () => {
  const [ballots, setBallots] = useState<BallotLayout[]>([]);
  const [currentBallot, setCurrentBallot] = useState<BallotLayout | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);

  // Sample parties with Indian political party data
  const [parties] = useState<Party[]>([
    { id: '1', name: 'Bharatiya Janata Party', symbol: '🪷', color: '#FF6B35', symbolImage: 'lotus.svg' },
    { id: '2', name: 'Indian National Congress', symbol: '✋', color: '#19AAED', symbolImage: 'hand.svg' },
    { id: '3', name: 'Aam Aadmi Party', symbol: '🧹', color: '#0066CC', symbolImage: 'broom.svg' },
    { id: '4', name: 'Bahujan Samaj Party', symbol: '🐘', color: '#22409A', symbolImage: 'elephant.svg' },
    { id: '5', name: 'Samajwadi Party', symbol: '🚲', color: '#FF2D2D', symbolImage: 'bicycle.svg' },
    { id: '6', name: 'All India Trinamool Congress', symbol: '🌸', color: '#20B2AA', symbolImage: 'flower.svg' },
    { id: '7', name: 'Independent', symbol: '🗳️', color: '#808080', symbolImage: 'ballot.svg' }
  ]);

  const [candidates, setCandidates] = useState<Candidate[]>([
    { id: '1', name: 'Rajesh Kumar Singh', partyId: '1', position: 1 },
    { id: '2', name: 'Priya Sharma Gupta', partyId: '2', position: 2 },
    { id: '3', name: 'Amit Patel', partyId: '3', position: 3 },
    { id: '4', name: 'Sunita Devi', partyId: '4', position: 4 },
    { id: '5', name: 'Mohammad Ali Khan', partyId: '5', position: 5 },
    { id: '6', name: 'Dr. Meera Krishnan', partyId: '6', position: 6 }
  ]);

  // Initialize with sample ballots
  useEffect(() => {
    const sampleBallots: BallotLayout[] = [
      {
        id: '1',
        title: 'Lok Sabha General Election 2026',
        electionType: 'national',
        layout: 'grid',
        columns: 2,
        headerConfig: {
          showTitle: true,
          showInstructions: true,
          showSymbols: true,
          fontSize: 'large',
          alignment: 'center'
        },
        candidates: candidates.slice(0, 6),
        backgroundColor: '#FFFFFF',
        borderStyle: 'solid',
        created: '2026-11-01',
        lastModified: '2026-11-02'
      }
    ];
    setBallots(sampleBallots);
  }, []);

  const createNewBallot = () => {
    const newBallot: BallotLayout = {
      id: Date.now().toString(),
      title: 'New Ballot Design',
      electionType: 'state',
      layout: 'grid',
      columns: 2,
      headerConfig: {
        showTitle: true,
        showInstructions: true,
        showSymbols: true,
        fontSize: 'medium',
        alignment: 'center'
      },
      candidates: [],
      backgroundColor: '#FFFFFF',
      borderStyle: 'solid',
      created: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0]
    };
    setBallots([...ballots, newBallot]);
    setCurrentBallot(newBallot);
    setIsEditing(true);
  };

  const getPartyByCandidate = (candidateId: string) => {
    const candidate = candidates.find(c => c.id === candidateId);
    return parties.find(p => p.id === candidate?.partyId);
  };

  const addCandidateToBallot = (candidateId: string) => {
    if (!currentBallot) return;
    
    const candidate = candidates.find(c => c.id === candidateId);
    if (candidate && !currentBallot.candidates.find(c => c.id === candidateId)) {
      const updatedBallot = {
        ...currentBallot,
        candidates: [...currentBallot.candidates, candidate],
        lastModified: new Date().toISOString().split('T')[0]
      };
      setCurrentBallot(updatedBallot);
    }
  };

  const removeCandidateFromBallot = (candidateId: string) => {
    if (!currentBallot) return;
    
    const updatedBallot = {
      ...currentBallot,
      candidates: currentBallot.candidates.filter(c => c.id !== candidateId),
      lastModified: new Date().toISOString().split('T')[0]
    };
    setCurrentBallot(updatedBallot);
  };

  const saveBallot = () => {
    if (!currentBallot) return;
    
    const updatedBallots = ballots.map(b => 
      b.id === currentBallot.id ? currentBallot : b
    );
    setBallots(updatedBallots);
    setIsEditing(false);
  };

  const renderBallotPreview = () => {
    if (!currentBallot) return null;

    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="bg-white rounded-lg p-6 shadow-lg" style={{ backgroundColor: currentBallot.backgroundColor }}>
          {/* Header */}
          {currentBallot.headerConfig.showTitle && (
            <div className={`text-${currentBallot.headerConfig.alignment} mb-4`}>
              <h2 className={`font-bold text-black ${
                currentBallot.headerConfig.fontSize === 'large' ? 'text-2xl' :
                currentBallot.headerConfig.fontSize === 'medium' ? 'text-xl' : 'text-lg'
              }`}>
                {currentBallot.title}
              </h2>
            </div>
          )}

          {currentBallot.headerConfig.showInstructions && (
            <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                📋 Instructions: Mark your choice by clicking on the candidate's symbol or name. 
                Only one selection is allowed per ballot.
              </p>
            </div>
          )}

          {/* Candidates Grid */}
          <div className={`grid gap-4 ${
            currentBallot.layout === 'grid' 
              ? `grid-cols-${currentBallot.columns}`
              : 'grid-cols-1'
          }`}>
            {currentBallot.candidates.map((candidate) => {
              const party = getPartyByCandidate(candidate.id);
              const isSelected = selectedCandidate === candidate.id;
              
              return (
                <div
                  key={candidate.id}
                  onClick={() => setSelectedCandidate(isSelected ? null : candidate.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105'
                      : `border-gray-300 bg-gray-50 hover:border-gray-400 hover:shadow-md ${
                          currentBallot.borderStyle === 'dotted' ? 'border-dotted' :
                          currentBallot.borderStyle === 'dashed' ? 'border-dashed' : 'border-solid'
                        }`
                  }`}
                  style={{ borderColor: isSelected ? '#3B82F6' : party?.color }}
                >
                  <div className="flex items-center space-x-3">
                    {/* Party Symbol */}
                    {currentBallot.headerConfig.showSymbols && (
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                        style={{ backgroundColor: `${party?.color}20` }}
                      >
                        {party?.symbol}
                      </div>
                    )}

                    {/* Candidate Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-black">{candidate.name}</h3>
                      <p className="text-sm text-gray-600">{party?.name}</p>
                    </div>

                    {/* Selection Indicator */}
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-500' 
                        : 'border-gray-400 bg-white'
                    }`}>
                      {isSelected && <div className="w-3 h-3 bg-white rounded-full"></div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              Election Commission of India | Secure Digital Voting System | VoteLink 2025
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (previewMode && currentBallot) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-black">Ballot Preview</h2>
          <button
            onClick={() => setPreviewMode(false)}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
          >
            Back to Editor
          </button>
        </div>
        
        <div className="max-w-4xl mx-auto">
          {renderBallotPreview()}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-black">Ballot Designer</h2>
        <button
          onClick={createNewBallot}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Ballot
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ballot List */}
        <div className="lg:col-span-1">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <h3 className="text-lg font-semibold text-black mb-4">Saved Ballots</h3>
            <div className="space-y-3">
              {ballots.map((ballot) => (
                <div
                  key={ballot.id}
                  onClick={() => setCurrentBallot(ballot)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                    currentBallot?.id === ballot.id
                      ? 'border-blue-500 bg-blue-50/50'
                      : 'border-white/30 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-black">{ballot.title}</h4>
                      <p className="text-sm text-black/70">
                        {ballot.candidates.length} candidates
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentBallot(ballot);
                          setIsEditing(true);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentBallot(ballot);
                          setPreviewMode(true);
                        }}
                        className="p-1 text-green-600 hover:bg-green-100 rounded"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Design Editor */}
        <div className="lg:col-span-2">
          {currentBallot ? (
            <div className="space-y-6">
              {/* Toolbar */}
              {isEditing && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Layout className="w-4 h-4 text-black" />
                      <select
                        value={currentBallot.layout}
                        onChange={(e) => setCurrentBallot({
                          ...currentBallot,
                          layout: e.target.value as 'grid' | 'list' | 'circular'
                        })}
                        className="px-3 py-1 rounded border border-white/30 bg-white/20 text-black"
                      >
                        <option value="grid">Grid Layout</option>
                        <option value="list">List Layout</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Type className="w-4 h-4 text-black" />
                      <select
                        value={currentBallot.headerConfig.fontSize}
                        onChange={(e) => setCurrentBallot({
                          ...currentBallot,
                          headerConfig: {
                            ...currentBallot.headerConfig,
                            fontSize: e.target.value as 'small' | 'medium' | 'large'
                          }
                        })}
                        className="px-3 py-1 rounded border border-white/30 bg-white/20 text-black"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Palette className="w-4 h-4 text-black" />
                      <input
                        type="color"
                        value={currentBallot.backgroundColor}
                        onChange={(e) => setCurrentBallot({
                          ...currentBallot,
                          backgroundColor: e.target.value
                        })}
                        className="w-10 h-8 rounded border border-white/30"
                      />
                    </div>

                    <button
                      onClick={saveBallot}
                      className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </button>

                    <button
                      onClick={() => setPreviewMode(true)}
                      className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </button>
                  </div>
                </div>
              )}

              {/* Candidate Selection */}
              {isEditing && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <h3 className="text-lg font-semibold text-black mb-4">Add Candidates</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {candidates.map((candidate) => {
                      const party = parties.find(p => p.id === candidate.partyId);
                      const isAdded = currentBallot.candidates.find(c => c.id === candidate.id);
                      
                      return (
                        <div
                          key={candidate.id}
                          className="flex items-center justify-between p-3 bg-white/10 rounded-lg border border-white/20"
                        >
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                              style={{ backgroundColor: `${party?.color}20` }}
                            >
                              {party?.symbol}
                            </div>
                            <div>
                              <p className="font-medium text-black">{candidate.name}</p>
                              <p className="text-sm text-black/70">{party?.name}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => isAdded 
                              ? removeCandidateFromBallot(candidate.id)
                              : addCandidateToBallot(candidate.id)
                            }
                            className={`px-3 py-1 rounded text-sm transition-colors duration-200 ${
                              isAdded
                                ? 'bg-red-500 text-white hover:bg-red-600'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                          >
                            {isAdded ? 'Remove' : 'Add'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Ballot Preview */}
              {renderBallotPreview()}
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-center">
              <Layout className="w-16 h-16 text-black/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-black mb-2">No Ballot Selected</h3>
              <p className="text-black/70 mb-4">
                Select an existing ballot from the list or create a new one to start designing.
              </p>
              <button
                onClick={createNewBallot}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
              >
                Create New Ballot
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BallotDesigner;