import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { HomepageBlock } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import IconButton from '../ui/IconButton';

const HomepageEditor: React.FC = () => {
    const { homepageBlocks, updateHomepageBlocks } = useAppContext();
    const [blocks, setBlocks] = useState<HomepageBlock[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setBlocks(homepageBlocks);
    }, [homepageBlocks]);

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        const newBlocks = [...blocks];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newBlocks.length) return;

        [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
        setBlocks(newBlocks);
    };

    const toggleEnabled = (id: HomepageBlock['id']) => {
        setBlocks(prev => prev.map(b => b.id === id ? { ...b, enabled: !b.enabled } : b));
    }

    const handleSave = async () => {
        setIsSaving(true);
        await updateHomepageBlocks(blocks);
        setIsSaving(false);
    }
    
    const hasChanges = JSON.stringify(blocks) !== JSON.stringify(homepageBlocks);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Редактор главной страницы</h1>
                <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
                    {isSaving ? 'Сохранение...' : 'Сохранить порядок'}
                </Button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Измените порядок или отключите блоки на главной странице.</p>
            <Card className="p-4">
                <div className="space-y-2">
                    {blocks.map((block, index) => (
                        <div key={block.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                            <div className="flex items-center">
                                <span className={`material-icons mr-3 ${block.enabled ? 'text-green-500' : 'text-gray-400'}`}>
                                    {block.id === 'categories' ? 'category' : block.id === 'featured' ? 'star' : 'article'}
                                </span>
                                <span className={!block.enabled ? 'line-through text-gray-500' : ''}>{block.title}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <label className="flex items-center cursor-pointer">
                                    <input type="checkbox" checked={block.enabled} onChange={() => toggleEnabled(block.id)} className="h-4 w-4 rounded text-primary" />
                                    <span className="ml-2 text-sm">Вкл</span>
                                </label>
                                <IconButton onClick={() => moveBlock(index, 'up')} disabled={index === 0}>
                                    <span className="material-icons">arrow_upward</span>
                                </IconButton>
                                <IconButton onClick={() => moveBlock(index, 'down')} disabled={index === blocks.length - 1}>
                                    <span className="material-icons">arrow_downward</span>
                                </IconButton>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default HomepageEditor;