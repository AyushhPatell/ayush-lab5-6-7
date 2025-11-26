import { useState, useEffect } from 'react';
import API_URL from '../config';

function Contact()
{
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
        consent: false
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [draftSaved, setDraftSaved] = useState(false);

    useEffect(() =>
    {
        const savedDraft = localStorage.getItem('contactFormDraft');
        if(savedDraft)
        {
            try
            {
                const draft = JSON.parse(savedDraft);
                setFormData(draft);
                setDraftSaved(true);
            }
            catch(err)
            {
                console.log('Error loading draft:', err);
            }
        }
    }, []);

    useEffect(() =>
    {
        if(formData.name || formData.email || formData.subject || formData.message)
        {
            localStorage.setItem('contactFormDraft', JSON.stringify(formData));
            setDraftSaved(true);
        }
    }, [formData]);

    function validateName(name)
    {
        if(!name.trim())
        {
            return 'Name is required';
        }
        const namePattern = /^[a-zA-Z\s'\-\p{M}]+$/u;
        if(!namePattern.test(name))
        {
            return 'Name must only contain letters, spaces, hyphens, apostrophes, and accents';
        }
        return '';
    }

    function validateEmail(email)
    {
        if(!email.trim())
        {
            return 'Email is required';
        }
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailPattern.test(email))
        {
            return 'Please enter a valid email address';
        }
        return '';
    }

    function validateSubject(subject)
    {
        if(!subject.trim())
        {
            return 'Subject is required';
        }
        const subjectPattern = /^[a-zA-Z\s]+$/;
        if(!subjectPattern.test(subject))
        {
            return 'Subject must only contain letters and spaces';
        }
        return '';
    }

    function validateMessage(message)
    {
        if(!message.trim())
        {
            return 'Message is required';
        }
        if(message.includes('<') || message.includes('>'))
        {
            return 'Message cannot contain HTML characters (< or >)';
        }
        return '';
    }

    function sanitizeInput(input)
    {
        return input.trim().replace(/[<>]/g, '');
    }

    function handleChange(e)
    {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        
        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));

        if(errors[name])
        {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    }

    function handleSubmit(e)
    {
        e.preventDefault();
        
        const newErrors = {};
        newErrors.name = validateName(formData.name);
        newErrors.email = validateEmail(formData.email);
        newErrors.subject = validateSubject(formData.subject);
        newErrors.message = validateMessage(formData.message);
        
        if(!formData.consent)
        {
            newErrors.consent = 'You must agree to be contacted';
        }

        setErrors(newErrors);

        if(Object.values(newErrors).some(error => error !== ''))
        {
            return;
        }

        setIsSubmitting(true);

        const sanitizedData = {
            name: sanitizeInput(formData.name),
            email: sanitizeInput(formData.email),
            subject: sanitizeInput(formData.subject),
            message: sanitizeInput(formData.message)
        };

        fetch(`${API_URL}/api/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sanitizedData)
        })
        .then(response => response.json())
        .then(data =>
        {
            setIsSubmitting(false);
            if(data.error)
            {
                setErrors({ submit: data.error });
            }
            else
            {
                setSubmitSuccess(true);
                setFormData({
                    name: '',
                    email: '',
                    subject: '',
                    message: '',
                    consent: false
                });
                localStorage.removeItem('contactFormDraft');
                setDraftSaved(false);
            }
        })
        .catch(err =>
        {
            setIsSubmitting(false);
            setErrors({ submit: 'Failed to send message. Please try again.' });
            console.log(err);
        });
    }

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <h1 className="text-center mb-4">Contact Me</h1>
                    
                    {draftSaved && !submitSuccess && (
                        <div className="alert alert-info mb-3">
                            Draft saved. Your form data has been restored.
                        </div>
                    )}

                    {submitSuccess && (
                        <div className="alert alert-success mb-3">
                            Message sent successfully! Thank you for contacting me.
                        </div>
                    )}

                    {errors.submit && (
                        <div className="alert alert-danger mb-3">
                            {errors.submit}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="mb-3">
                            <label htmlFor="name" className="form-label">Name</label>
                            <input
                                type="text"
                                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                aria-describedby={errors.name ? 'name-error' : undefined}
                                aria-invalid={errors.name ? 'true' : 'false'}
                            />
                            {errors.name && (
                                <div className="invalid-feedback" id="name-error" role="alert">
                                    {errors.name}
                                </div>
                            )}
                        </div>

                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input
                                type="email"
                                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                aria-describedby={errors.email ? 'email-error' : undefined}
                                aria-invalid={errors.email ? 'true' : 'false'}
                            />
                            {errors.email && (
                                <div className="invalid-feedback" id="email-error" role="alert">
                                    {errors.email}
                                </div>
                            )}
                        </div>

                        <div className="mb-3">
                            <label htmlFor="subject" className="form-label">Subject</label>
                            <input
                                type="text"
                                className={`form-control ${errors.subject ? 'is-invalid' : ''}`}
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                aria-describedby={errors.subject ? 'subject-error' : undefined}
                                aria-invalid={errors.subject ? 'true' : 'false'}
                            />
                            {errors.subject && (
                                <div className="invalid-feedback" id="subject-error" role="alert">
                                    {errors.subject}
                                </div>
                            )}
                        </div>

                        <div className="mb-3">
                            <label htmlFor="message" className="form-label">Message</label>
                            <textarea
                                className={`form-control ${errors.message ? 'is-invalid' : ''}`}
                                id="message"
                                name="message"
                                rows="5"
                                value={formData.message}
                                onChange={handleChange}
                                aria-describedby={errors.message ? 'message-error' : undefined}
                                aria-invalid={errors.message ? 'true' : 'false'}
                            />
                            {errors.message && (
                                <div className="invalid-feedback" id="message-error" role="alert">
                                    {errors.message}
                                </div>
                            )}
                        </div>

                        <div className="mb-3">
                            <div className="form-check">
                                <input
                                    className={`form-check-input ${errors.consent ? 'is-invalid' : ''}`}
                                    type="checkbox"
                                    id="consent"
                                    name="consent"
                                    checked={formData.consent}
                                    onChange={handleChange}
                                />
                                <label className="form-check-label" htmlFor="consent">
                                    I agree to be contacted using the information provided, and understand that my information will be stored securely.
                                </label>
                                {errors.consent && (
                                    <div className="invalid-feedback d-block" id="consent-error" role="alert">
                                        {errors.consent}
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting}
                            aria-label={isSubmitting ? 'Submitting form' : 'Submit contact form'}
                        >
                            {isSubmitting ? 'Sending...' : 'Submit'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Contact;

