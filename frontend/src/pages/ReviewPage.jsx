import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function ReviewPage() {
  const { id } = useParams();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await client.get(`/api/reviews/${id}/`);
        setReview(res.data);
      } catch (err) {
        setError('Failed to load review.');
      } finally {
        setLoading(false);
      }
    };
    fetchReview();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!review) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-2xl">Review: {review.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Status: {review.status}</p>
          <p>Created: {new Date(review.created_at).toLocaleString()}</p>
          <hr className="my-4" />
          {review.files.map((file) => (
            <div key={file.id} className="mb-4">
              <h3 className="font-medium">{file.filename}</h3>
              <pre className="bg-gray-100 p-2 rounded overflow-x-auto">{file.file_content}</pre>
              {file.comments.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {file.comments.map((c) => (
                    <li key={c.id} className="text-sm">
                      <strong>Line {c.line_number}:</strong> [{c.severity}] {c.comment}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          <Link to="/dashboard" className="text-blue-600 hover:underline">Back to Dashboard</Link>
        </CardContent>
      </Card>
    </div>
  );
}
