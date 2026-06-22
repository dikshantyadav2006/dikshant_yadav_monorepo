'use client';

import React, { useState, useEffect } from 'react';
import { useVisualBuilderStore } from '../../features/visual-builder/store';
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Plus, 
  Trash2, 
  ChevronDown, 
  Sliders,
  Palette
} from 'lucide-react';
import apiFetch from '../../lib/api';
import type { Category, Tag } from '@dikshant/types';
import MediaField from './MediaField';

export function Inspector() {
  const activeNodeId = useVisualBuilderStore((state) => state.activeNodeId);
  const canvasData = useVisualBuilderStore((state) => state.canvasData);
  const setNodes = useVisualBuilderStore((state) => state.setNodes);
  const updateNodeData = useVisualBuilderStore((state) => state.updateNodeData);
  const setActiveNode = useVisualBuilderStore((state) => state.setActiveNode);
  const postMetadata = useVisualBuilderStore((state) => state.postMetadata);
  const updatePostMetadata = useVisualBuilderStore((state) => state.updatePostMetadata);

  const [activeTab, setActiveTab] = useState<'properties' | 'styles'>('properties');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    async function loadMeta() {
      try {
        const [cats, tagList] = await Promise.all([
          apiFetch<Category[]>('/categories'),
          apiFetch<Tag[]>('/tags'),
        ]);
        setCategories(cats);
        setTags(tagList);
      } catch (err) {
        console.error('Failed to load categories/tags in Inspector:', err);
      }
    }
    loadMeta();
  }, []);

  const selectedNode = canvasData.nodes.find((n) => n.id === activeNodeId);

  const updateMetadataField = (key: string, value: any) => {
    updatePostMetadata({ [key]: value });
  };

  const toggleTag = (tagId: string) => {
    if (!postMetadata) return;
    const currentTags = postMetadata.tagIds || [];
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter((id) => id !== tagId)
      : [...currentTags, tagId];
    updateMetadataField('tagIds', newTags);
  };

  // If no node is selected, display global Post Settings
  if (!selectedNode) {
    return (
      <aside className="w-80 border-l border-border bg-card flex flex-col h-full flex-shrink-0 select-none">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border/60 bg-muted/10">
          <div className="text-xs font-bold text-foreground font-sans">Post Settings</div>
          <div className="text-[10px] text-muted-foreground mt-0.5 font-sans">Configure global post metadata</div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {postMetadata ? (
            <>
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase font-sans">Post Title</label>
                <input
                  type="text"
                  required
                  value={postMetadata.title || ''}
                  onChange={(e) => updateMetadataField('title', e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary font-semibold font-sans"
                  placeholder="Untitled Post"
                />
              </div>

              {/* Excerpt */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase font-sans">Excerpt</label>
                <textarea
                  rows={3}
                  value={postMetadata.excerpt || ''}
                  onChange={(e) => updateMetadataField('excerpt', e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary min-h-[60px] font-sans"
                  placeholder="Short description..."
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase font-sans">Category</label>
                <select
                  value={postMetadata.categoryId || ''}
                  onChange={(e) => updateMetadataField('categoryId', e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary font-sans"
                >
                  <option value="">No category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase font-sans">Tags</label>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => {
                      const selected = (postMetadata.tagIds || []).includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleTag(tag.id)}
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold font-sans transition ${
                            selected
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          {tag.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Featured */}
              <label className="flex items-center gap-2 text-xs font-semibold py-1 cursor-pointer font-sans">
                <input
                  type="checkbox"
                  checked={postMetadata.featured || false}
                  onChange={(e) => updateMetadataField('featured', e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary cursor-pointer"
                />
                <span>Featured Post</span>
              </label>

              {/* SEO Divider */}
              <hr className="border-border/40 my-3" />

              {/* SEO Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase font-sans">SEO Title</label>
                <input
                  type="text"
                  value={postMetadata.seoTitle || ''}
                  onChange={(e) => updateMetadataField('seoTitle', e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary font-sans"
                  placeholder="Search engine title..."
                />
              </div>

              {/* SEO Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase font-sans">SEO Description</label>
                <textarea
                  rows={3}
                  value={postMetadata.seoDescription || ''}
                  onChange={(e) => updateMetadataField('seoDescription', e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary min-h-[60px] font-sans"
                  placeholder="Search engine description..."
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-[10px] text-muted-foreground mt-2 font-sans">Loading settings...</span>
            </div>
          )}
        </div>
      </aside>
    );
  }

  const { type } = selectedNode;
  const data = selectedNode.data as any;

  const updateField = (key: string, value: any) => {
    updateNodeData(selectedNode.id, { [key]: value });
  };

  const handleDelete = () => {
    setNodes(canvasData.nodes.filter((node) => node.id !== selectedNode.id));
    setActiveNode(null);
  };

  // Helper for rendering multiple options for Question/Poll
  const handleOptionChange = (index: number, label: string) => {
    const options = [...((data.options as any[]) || [])];
    options[index] = { ...options[index], label };
    updateField('options', options);
  };

  const addOption = () => {
    const options = [...((data.options as any[]) || [])];
    options.push({ id: `opt-${crypto.randomUUID().slice(0, 6)}`, label: `New Option` });
    updateField('options', options);
  };

  const removeOption = (index: number) => {
    const options = [...((data.options as any[]) || [])];
    options.splice(index, 1);
    updateField('options', options);
  };

  // Helper for Gallery images list
  const handleGalleryImageChange = (index: number, src: string) => {
    const items = [...((data.items as any[]) || [])];
    items[index] = src;
    updateField('items', items);
  };

  const addGalleryImage = () => {
    const items = [...((data.items as any[]) || [])];
    items.push('');
    updateField('items', items);
  };

  const removeGalleryImage = (index: number) => {
    const items = [...((data.items as any[]) || [])];
    items.splice(index, 1);
    updateField('items', items);
  };

  return (
    <aside className="w-80 border-l border-border bg-card flex flex-col h-full flex-shrink-0 select-none">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/60 bg-muted/10">
        <div className="text-xs font-bold text-foreground capitalize">{type} Settings</div>
        <div className="text-[10px] text-muted-foreground mt-0.5 truncate">ID: {selectedNode.id}</div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/60 bg-muted/20 p-1.5 gap-1">
        <button
          onClick={() => setActiveTab('properties')}
          className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${
            activeTab === 'properties'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Properties
        </button>
        <button
          onClick={() => setActiveTab('styles')}
          className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${
            activeTab === 'styles'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Styles
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 no-scrollbar">
        {activeTab === 'properties' ? (
          <div className="space-y-4">
            {/* 1. Heading Properties */}
            {type === 'heading' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Heading Text</label>
                  <textarea
                    value={data.text || ''}
                    onChange={(e) => updateField('text', e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary min-h-[60px]"
                    placeholder="Enter heading..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">HTML Tag</label>
                  <select
                    value={data.level || 2}
                    onChange={(e) => updateField('level', Number(e.target.value))}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value={1}>H1 (Main title)</option>
                    <option value={2}>H2 (Section heading)</option>
                    <option value={3}>H3 (Sub-section)</option>
                  </select>
                </div>
              </>
            )}

            {/* 2. Text Properties */}
            {type === 'text' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Body Content</label>
                <textarea
                  value={data.body || ''}
                  onChange={(e) => updateField('body', e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary min-h-[160px] leading-relaxed"
                  placeholder="Start typing..."
                />
              </div>
            )}

            {/* 3. Image Properties */}
            {type === 'image' && (
              <>
                <MediaField
                  label="Image Source"
                  value={(data.src as string) || ''}
                  onChange={(url) => updateField('src', url)}
                  accept="image/*"
                  placeholder="Upload or paste image URL (Cloudinary, Pexels, etc.)"
                />
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Alt Description</label>
                  <input
                    type="text"
                    value={data.alt || ''}
                    onChange={(e) => updateField('alt', e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Descriptive alt text..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Caption</label>
                  <input
                    type="text"
                    value={data.caption || ''}
                    onChange={(e) => updateField('caption', e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Optional image caption..."
                  />
                </div>
              </>
            )}

            {/* 4. Video Properties */}
            {type === 'video' && (
              <>
                <MediaField
                  label="Video Source"
                  value={(data.src as string) || ''}
                  onChange={(url) => updateField('src', url)}
                  accept="video/*"
                  placeholder="Upload video or paste YouTube/Vimeo/direct URL"
                />
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Title</label>
                  <input
                    type="text"
                    value={data.title || ''}
                    onChange={(e) => updateField('title', e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Video title..."
                  />
                </div>
              </>
            )}

            {/* 5. Gallery Properties */}
            {type === 'gallery' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Images list</label>
                  <button
                    onClick={addGalleryImage}
                    className="text-[10px] flex items-center gap-0.5 text-primary hover:underline font-semibold"
                  >
                    <Plus className="w-3 h-3" /> Add Image
                  </button>
                </div>
                <div className="space-y-2">
                  {((data.items as any[]) || []).map((src: string, index: number) => (
                    <div key={index} className="flex gap-1.5 items-start">
                      <div className="flex-1">
                        <MediaField
                          label={`Image ${index + 1}`}
                          value={src}
                          onChange={(url) => handleGalleryImageChange(index, url)}
                          accept="image/*"
                          placeholder="Upload or paste URL"
                        />
                      </div>
                      <button
                        onClick={() => removeGalleryImage(index)}
                        className="text-muted-foreground/60 hover:text-destructive p-1.5 rounded hover:bg-muted mt-5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {((data.items as any[]) || []).length === 0 && (
                    <div className="text-center py-4 border border-dashed border-border/40 rounded-xl text-muted-foreground/60 text-[10px]">
                      No images added. Click "Add Image" above.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 6. Quote Properties */}
            {type === 'quote' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Quote Text</label>
                  <textarea
                    value={data.quote || ''}
                    onChange={(e) => updateField('quote', e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary min-h-[80px]"
                    placeholder="Quote text..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Attribution</label>
                  <input
                    type="text"
                    value={data.attribution || ''}
                    onChange={(e) => updateField('attribution', e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Author name..."
                  />
                </div>
              </>
            )}

            {/* 7. Code Block Properties */}
            {type === 'code-block' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Language</label>
                  <select
                    value={data.language || 'typescript'}
                    onChange={(e) => updateField('language', e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="python">Python</option>
                    <option value="bash">Bash</option>
                    <option value="json">JSON</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Code Snippet</label>
                  <textarea
                    value={data.code || ''}
                    onChange={(e) => updateField('code', e.target.value)}
                    className="w-full rounded-xl border border-input bg-background p-2.5 font-mono text-[10px] outline-none focus:ring-1 focus:ring-primary min-h-[140px] leading-normal"
                    placeholder="// Write code here..."
                  />
                </div>
              </>
            )}

            {/* 8. Embed Properties */}
            {type === 'embed' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Embed URL</label>
                <input
                  type="text"
                  value={data.url || ''}
                  onChange={(e) => updateField('url', e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                  placeholder="https://codepen.io/... or iframe link"
                />
              </div>
            )}

            {/* 9. Question Properties */}
            {type === 'question' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Question Prompt</label>
                  <input
                    type="text"
                    value={data.prompt || ''}
                    onChange={(e) => updateField('prompt', e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Enter question prompt..."
                  />
                </div>
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Options</label>
                    <button
                      onClick={addOption}
                      className="text-[10px] flex items-center gap-0.5 text-primary hover:underline font-semibold"
                    >
                      <Plus className="w-3 h-3" /> Add Option
                    </button>
                  </div>
                  <div className="space-y-2">
                    {((data.options as any[]) || []).map((opt: any, index: number) => (
                      <div key={opt.id} className="flex gap-1.5 items-center">
                        <input
                          type="text"
                          value={opt.label}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          className="flex-1 rounded-xl border border-input bg-background px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary"
                          placeholder={`Option ${index + 1}`}
                        />
                        <button
                          onClick={() => removeOption(index)}
                          className="text-muted-foreground/60 hover:text-destructive p-1.5 rounded hover:bg-muted"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* 10. Poll Properties */}
            {type === 'poll' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Poll Question</label>
                  <input
                    type="text"
                    value={data.prompt || ''}
                    onChange={(e) => updateField('prompt', e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Enter poll question..."
                  />
                </div>
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Poll Options</label>
                    <button
                      onClick={addOption}
                      className="text-[10px] flex items-center gap-0.5 text-primary hover:underline font-semibold"
                    >
                      <Plus className="w-3 h-3" /> Add Option
                    </button>
                  </div>
                  <div className="space-y-2">
                    {((data.options as any[]) || []).map((opt: any, index: number) => (
                      <div key={opt.id} className="flex gap-1.5 items-center">
                        <input
                          type="text"
                          value={opt.label}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          className="flex-1 rounded-xl border border-input bg-background px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary"
                          placeholder={`Option ${index + 1}`}
                        />
                        <button
                          onClick={() => removeOption(index)}
                          className="text-muted-foreground/60 hover:text-destructive p-1.5 rounded hover:bg-muted"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* 11. Button Properties */}
            {type === 'button' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Button Text</label>
                  <input
                    type="text"
                    value={data.label || ''}
                    onChange={(e) => updateField('label', e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Call to Action"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Link URL</label>
                  <input
                    type="text"
                    value={data.href || ''}
                    onChange={(e) => updateField('href', e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                    placeholder="https://example.com"
                  />
                </div>
              </>
            )}

            {/* 12. AI Block Properties */}
            {type === 'ai-block' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Prompt</label>
                  <textarea
                    value={data.prompt || ''}
                    onChange={(e) => updateField('prompt', e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary min-h-[80px]"
                    placeholder="Summarize this section..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Output Type</label>
                  <select
                    value={data.outputType || 'text'}
                    onChange={(e) => updateField('outputType', e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="text">Text block</option>
                    <option value="image">Image generation</option>
                    <option value="quiz">Interactive Quiz</option>
                  </select>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Visual Styling */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Alignment</label>
              <div className="flex rounded-xl border border-border bg-background p-1.5 gap-1 w-full justify-between">
                <button
                  type="button"
                  onClick={() => updateField('alignment', 'left')}
                  className={`flex-1 flex justify-center py-1.5 rounded transition ${
                    (data.alignment || 'left') === 'left' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => updateField('alignment', 'center')}
                  className={`flex-1 flex justify-center py-1.5 rounded transition ${
                    data.alignment === 'center' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => updateField('alignment', 'right')}
                  className={`flex-1 flex justify-center py-1.5 rounded transition ${
                    data.alignment === 'right' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <AlignRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Background Color</label>
              <select
                value={data.background || 'transparent'}
                onChange={(e) => updateField('background', e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="transparent">Transparent</option>
                <option value="muted">Light Gray</option>
                <option value="accent">Theme Accent</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Margin Top (px)</label>
                <input
                  type="number"
                  min={0}
                  max={120}
                  value={data.marginTop !== undefined ? data.marginTop : 24}
                  onChange={(e) => updateField('marginTop', Number(e.target.value))}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Margin Bottom (px)</label>
                <input
                  type="number"
                  min={0}
                  max={120}
                  value={data.marginBottom !== undefined ? data.marginBottom : 24}
                  onChange={(e) => updateField('marginBottom', Number(e.target.value))}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="border-t border-border/40 pt-3 mt-3">
              <button
                type="button"
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                className="flex items-center justify-between w-full text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase transition-colors"
              >
                <span>Advanced Settings</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isAdvancedOpen ? 'rotate-180' : ''}`} />
              </button>

              {isAdvancedOpen && (
                <div className="space-y-3 pt-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Custom CSS Class</label>
                    <input
                      type="text"
                      value={data.customClass || ''}
                      onChange={(e) => updateField('customClass', e.target.value)}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                      placeholder="e.g. shadow-lg rounded-3xl"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Button footer */}
      <div className="p-4 border-t border-border/60 bg-muted/10">
        <button
          onClick={handleDelete}
          className="w-full py-2.5 rounded-xl border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 text-destructive text-xs font-bold transition flex items-center justify-center gap-1.5 hover:border-destructive/30"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete Block
        </button>
      </div>
    </aside>
  );
}

export default Inspector;
