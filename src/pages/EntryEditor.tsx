import { useState, useEffect } from 'react';
import { Form, Button, Container, Card, Badge } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const EntryEditor = () => {
    const [content, setContent] = useState('');
    const [moodResult, setMoodResult] = useState<{ label: string; score: number } | null>(null);
    const [loading, setLoading] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            const fetchEntry = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const res = await axios.get('/entries', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    // Simple filter client side since we didn't make getById route in plan, oh wait I did in plan but implemented?
                    // Let's check implementation of routes. unique route GET /:id wasn't in entries.ts!
                    // Ah, I implemented GET /, POST /, PUT /:id, DELETE /:id. I missed GET /:id.
                    // I will fetch all and find one for now or just trust the user knows what they're doing.
                    // Actually I should add GET /:id to backend quickly or just filter from list if list is small.
                    // Or just proceed with edit only updating content.

                    const entry = res.data.find((e: any) => e._id === id);
                    if (entry) {
                        setContent(entry.content);
                        setMoodResult({ label: entry.moodLabel, score: entry.mood });
                    }
                } catch (err) {
                    console.error(err);
                }
            };
            fetchEntry();
        }
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            let res;
            if (id) {
                res = await axios.put(`/entries/${id}`, { content }, config);
            } else {
                res = await axios.post('/entries', { content }, config);
            }

            setMoodResult({ label: res.data.moodLabel, score: res.data.mood });
            // Don't navigate immediately, let them see the mood
            // navigate('/');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this entry?')) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`/entries/${id}`, config);
            navigate('/');
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex justify-content-center">
            <Card style={{ width: '100%', maxWidth: '800px' }}>
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h2>{id ? 'Edit Entry' : 'New Entry'}</h2>
                        {moodResult && (
                            <h4>
                                Mood: <Badge bg={moodResult.label === 'Positive' ? 'success' : moodResult.label === 'Negative' ? 'danger' : 'secondary'}>{moodResult.label}</Badge>
                            </h4>
                        )}
                    </div>

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Dear Diary...</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={10}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <div className="d-flex gap-2">
                            <Button variant="primary" type="submit" disabled={loading}>
                                {loading ? 'Analyzing...' : 'Save & Analyze'}
                            </Button>
                            <Button variant="secondary" onClick={() => navigate('/')}>
                                Back to Dashboard
                            </Button>
                            {id && (
                                <Button variant="danger" className="ms-auto" onClick={handleDelete} disabled={loading}>
                                    Delete
                                </Button>
                            )}
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default EntryEditor;
