import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const fetchReviews = async () => {
    try {
      const res = await client.get('/api/reviews/');
      setReviews(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);
    try {
      const res = await client.post('/api/reviews/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate(`/review/${res.data.id}`);
    } catch (err) {
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this review?')) return;
    await client.delete(`/api/reviews/${id}/`);
    setReviews(reviews.filter((r) => r.id !== id));
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold">AI Code Reviewer</h1>
        <Button onClick={handleLogout}>Logout</Button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8 flex-1 overflow-y-auto">
        {/* Upload Section */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h2 className="text-lg font-medium">New Review</h2>
            <p className="text-sm text-gray-500">
              Upload a single code file (.py, .js, .ts, .jsx, .tsx, .java, etc.) or a .zip folder.
            </p>
            <div className="flex gap-4 items-center">
              <input
                type="file"
                accept=".py,.js,.ts,.jsx,.tsx,.java,.cpp,.c,.go,.rb,.php,.css,.html,.zip"
                onChange={(e) => setFile(e.target.files[0])}
                className="text-sm"
              />
              <Button onClick={handleUpload} disabled={!file || uploading}>
                {uploading ? 'Analyzing...' : 'Upload & Review'}
              </Button>
            </div>
            {uploading && (
              <p className="text-sm text-blue-600 animate-pulse">
                AI is reviewing your code. This may take 10–30 seconds...
              </p>
            )}
          </CardContent>
        </Card>

        {/* Past Reviews */}
        <div>
          <h2 className="text-lg font-medium mb-4">Past Reviews</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-gray-400 text-sm">No reviews yet. Upload a file above.</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((r) => (
                <Card key={r.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/review/${r.id}`)}>
                  <CardContent className="pt-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{r.title}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(r.created_at).toLocaleString()} · {r.file_count} file(s)
                      </p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Badge variant={r.status === 'done' ? 'default' : 'secondary'}>{r.status}</Badge>
                      <Button variant="ghost" size="sm" className="text-red-500" onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }}>
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
