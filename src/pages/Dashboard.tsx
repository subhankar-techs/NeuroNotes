import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import axios from 'axios';
import { Link } from 'react-router-dom';

interface Entry {
    _id: string;
    content: string;
    moodLabel: string;
    mood: number;
    createdAt: string;
}

const Dashboard = () => {
    const [entries, setEntries] = useState<Entry[]>([]);

    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('/entries', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setEntries(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchEntries();
    }, []);

    const getMoodVariant = (label: string) => {
        if (label === 'Positive') return 'success';
        if (label === 'Negative') return 'danger';
        return 'secondary';
    };

    return (
        <Container>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Your NeuroNotes</h1>
                <Link to="/new">
                    <Button variant="primary">New Entry</Button>
                </Link>
            </div>
            <Row>
                {entries.map(entry => (
                    <Col md={12} key={entry._id} className="mb-3">
                        <Card>
                            <Card.Header className="d-flex justify-content-between">
                                <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                                <Badge bg={getMoodVariant(entry.moodLabel)}>{entry.moodLabel}</Badge>
                            </Card.Header>
                            <Card.Body>
                                <Card.Text style={{ whiteSpace: 'pre-wrap' }}>
                                    {entry.content}
                                </Card.Text>
                                <Link to={`/entry/${entry._id}`}>
                                    <Button variant="outline-secondary" size="sm">Edit</Button>
                                </Link>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
                {entries.length === 0 && <p className="text-center text-muted">No entries yet. Start writing!</p>}
            </Row>
        </Container>
    );
};

export default Dashboard;
