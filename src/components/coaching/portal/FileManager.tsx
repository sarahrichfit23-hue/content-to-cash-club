import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { 
  Upload, Folder, File, Download, Trash2, 
  FileText, FileVideo, FileImage, FolderPlus,
  ArrowLeft, Search, MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface FileItem {
  id: string;
  client_id: string;
  folder_path: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  created_at: string;
}

interface FileManagerProps {
  clientId: string;
}

export function FileManager({ clientId }: FileManagerProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState('/');
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);

  useEffect(() => {
    loadFiles();
  }, [clientId, currentPath]);

  const loadFiles = async () => {
    const { data, error } = await supabase
      .from('client_files')
      .select('*')
      .eq('client_id', clientId)
      .eq('folder_path', currentPath)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load files');
      return;
    }
    setFiles(data || []);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setUploading(true);
    const file = fileList[0];
    const storagePath = `${clientId}${currentPath}${file.name}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('client-files')
        .upload(storagePath, file);

      if (uploadError) throw uploadError;

      const { data: { user } } = await supabase.auth.getUser();
      
      const { error: dbError } = await supabase
        .from('client_files')
        .insert({
          client_id: clientId,
          folder_path: currentPath,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: storagePath,
          uploaded_by: user?.id
        });

      if (dbError) throw dbError;

      toast.success('File uploaded successfully');
      loadFiles();
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (file: FileItem) => {
    const { data, error } = await supabase.storage
      .from('client-files')
      .download(file.storage_path);

    if (error) {
      toast.error('Failed to download file');
      return;
    }

    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.file_name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (file: FileItem) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    const { error: storageError } = await supabase.storage
      .from('client-files')
      .remove([file.storage_path]);

    if (storageError) {
      toast.error('Failed to delete file');
      return;
    }

    const { error: dbError } = await supabase
      .from('client_files')
      .delete()
      .eq('id', file.id);

    if (dbError) {
      toast.error('Failed to delete file record');
      return;
    }

    toast.success('File deleted');
    loadFiles();
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;

    const folderPath = `${currentPath}${newFolderName}/`;
    
    // Create a placeholder file to create the folder
    const { error } = await supabase.storage
      .from('client-files')
      .upload(`${clientId}${folderPath}.keep`, new Blob(['']));

    if (error) {
      toast.error('Failed to create folder');
      return;
    }

    toast.success('Folder created');
    setNewFolderName('');
    setShowNewFolder(false);
    loadFiles();
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <FileImage className="h-8 w-8 text-blue-500" />;
    if (fileType.startsWith('video/')) return <FileVideo className="h-8 w-8 text-purple-500" />;
    if (fileType.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />;
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const filteredFiles = files.filter(f => 
    f.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {currentPath !== '/' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const parts = currentPath.split('/').filter(Boolean);
                parts.pop();
                setCurrentPath(parts.length ? `/${parts.join('/')}/` : '/');
              }}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <span className="text-sm text-muted-foreground">
            {currentPath === '/' ? 'Root' : currentPath}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNewFolder(!showNewFolder)}
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            New Folder
          </Button>

          <Button size="sm" disabled={uploading} asChild>
            <label className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload File'}
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          </Button>
        </div>
      </div>

      {showNewFolder && (
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createFolder()}
            />
            <Button onClick={createFolder}>Create</Button>
            <Button variant="ghost" onClick={() => setShowNewFolder(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredFiles.map((file) => (
          <Card key={file.id} className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              {getFileIcon(file.file_type)}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleDownload(file)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDelete(file)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <h4 className="font-medium text-sm mb-1 truncate" title={file.file_name}>
              {file.file_name}
            </h4>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(file.file_size)}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(file.created_at).toLocaleDateString()}
            </p>
          </Card>
        ))}
      </div>

      {filteredFiles.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No files in this folder</p>
        </div>
      )}
    </div>
  );
}
