import { useState, useEffect } from 'react';
import API_URL from '../config';

function Messages()
{
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() =>
    {
        fetch(`${API_URL}/api/messages`)
            .then(response => response.json())
            .then(data =>
            {
                if (data.error)
                {
                    setError(data.error);
                }
                else
                {
                    setMessages(data);
                }
                setLoading(false);
            })
            .catch(err =>
            {
                setError('Failed to load messages');
                setLoading(false);
                console.log(err);
            });
    }, []);

    if (loading)
    {
        return (
            <div className="container py-5">
                <h1 className="text-center mb-5">Messages</h1>
                <p className="text-center">Loading messages...</p>
            </div>
        );
    }

    if (error)
    {
        return (
            <div className="container py-5">
                <h1 className="text-center mb-5">Messages</h1>
                <div className="alert alert-danger">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <h1 className="text-center mb-5">Messages</h1>

            {messages.length === 0 ? (
                <div className="alert alert-info">
                    No messages yet.
                </div>
            ) : (
                <div className="row">
                    {messages.map((message, index) => (
                        <div key={index} className="col-md-6 mb-4">
                            <div className="card h-100">
                                <div className="card-body">
                                    <h5 className="card-title">{message.name}</h5>
                                    <h6 className="card-subtitle mb-2 text-muted">{message.subject}</h6>
                                    <p className="card-text">{message.message}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Messages;

