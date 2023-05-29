import React, { useState } from 'react';
import { Formik, Field, Form, ErrorMessage, useFormikContext } from 'formik';
import { format } from 'date-fns';
import '../DishForm.css';
import 'bootstrap/dist/css/bootstrap.min.css';

interface DishFormData {
    name: string;
    preparation_time: string;
    type: string;
    no_of_slices?: number;
    no_of_slices_error?: string;
    diameter?: number;
    diameter_error?: string;
    spiciness_scale?: number;
    spiciness_scale_error?: string;
    slices_of_bread?: number;
    slices_of_bread_error?: string;
}

const DishForm: React.FC = () => {
    const initialValues: DishFormData = {
        name: '',
        preparation_time: '',
        type: '',
        no_of_slices: 1,
        no_of_slices_error: '',
        diameter: 1,
        diameter_error: '',
        spiciness_scale: 1,
        spiciness_scale_error: '',
        slices_of_bread: 1,
        slices_of_bread_error: '',
    };

    const [submissionStatus, setSubmissionStatus] = useState<
        'idle' | 'pending' | 'success' | 'error'
        >('idle');

    const handleSubmit = async (values: DishFormData) => {
        setSubmissionStatus('pending');

        try {
            const formattedValues: DishFormData = {
                name: values.name,
                preparation_time: format(
                    new Date(`2000-01-01T${values.preparation_time}`),
                    'HH:mm:ss'
                ),
                type: values.type,
            };

            if (values.type === 'pizza') {
                formattedValues.no_of_slices = values.no_of_slices;
                formattedValues.diameter = values.diameter;
            } else if (values.type === 'soup') {
                formattedValues.spiciness_scale = values.spiciness_scale;
            } else if (values.type === 'sandwich') {
                formattedValues.slices_of_bread = values.slices_of_bread;
            }

            const response = await fetch(
                'https://umzzcc503l.execute-api.us-west-2.amazonaws.com/dishes/',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formattedValues),
                }
            );

            if (!response.ok) {
                const data = await response.json();
                console.log('Validation errors:', data);
                setSubmissionStatus('error');
            } else {
                const data = await response.json();
                console.log('Success:', data);
                setSubmissionStatus('success');
            }
        } catch (error) {
            console.error('Error:', error);
            setSubmissionStatus('error');
        }
    };

    const ConditionalFields: React.FC = () => {
        const { values } = useFormikContext<DishFormData>();

        if (values.type === 'pizza') {
            return (
                <>
                    <div>
                        <label htmlFor="no_of_slices">Number of Slices:</label>
                        <Field type="number" id="no_of_slices" name="no_of_slices" />
                        <ErrorMessage name="no_of_slices_error" component="div" className="error" />
                    </div>
                    <div>
                        <label htmlFor="diameter">Diameter:</label>
                        <Field type="number" id="diameter" name="diameter" />
                        <ErrorMessage name="diameter_error" component="div" className="error" />
                    </div>
                </>
            );
        }

        if (values.type === 'soup') {
            return (
                <div>
                    <label htmlFor="spiciness_scale">Spiciness Scale:</label>
                    <Field type="number" id="spiciness_scale" name="spiciness_scale" />
                    <ErrorMessage name="spiciness_scale_error" component="div" className="error" />
                </div>
            );
        }

        if (values.type === 'sandwich') {
            return (
                <div>
                    <label htmlFor="slices_of_bread">Slices of Bread:</label>
                    <Field type="number" id="slices_of_bread" name="slices_of_bread" />
                    <ErrorMessage name="slices_of_bread_error" component="div" className="error" />
                </div>
            );
        }

        return null;
    };

    const renderSubmissionMessage = () => {
        if (submissionStatus === 'pending') {
            return <div>Submitting form...</div>;
        } else if (submissionStatus === 'success') {
            return <div>Form submitted successfully!</div>;
        } else if (submissionStatus === 'error') {
            return <div>An error occurred while submitting the form.</div>;
        }

        return null;
    };

    return (
        <div className="form-container">
            <Formik
                initialValues={initialValues}
                validate={(values) => {
                    const errors: Partial<DishFormData> = {};

                    if (!values.name) {
                        errors.name = 'Name is required';
                    } else if (values.name.length < 3) {
                        errors.name = 'Name has to be at least 3 characters long';
                    }

                    if (!values.preparation_time) {
                        errors.preparation_time = 'Preparation Time is required';
                    }

                    if (!values.type) {
                        errors.type = 'Type is required';
                    }

                    if (values.type === 'pizza') {
                        if (!values.no_of_slices) {
                            errors.no_of_slices_error = 'Number of Slices is required';
                        } else if (Number(values.no_of_slices) < 1) {
                            errors.no_of_slices_error = 'Number of Slices must be greater than 0';
                        }

                        if (!values.diameter) {
                            errors.diameter_error = 'Diameter is required';
                        } else if (Number(values.diameter) < 1) {
                            errors.diameter_error = 'Diameter has to be greater than 0'
                        }
                    }

                    if (values.type === 'soup') {
                        if (!values.spiciness_scale) {
                            errors.spiciness_scale_error = 'Spiciness Scale is required';
                        } else if (Number(values.spiciness_scale) < 1 || Number(values.spiciness_scale) > 10) {
                            errors.spiciness_scale_error = 'Spiciness scale must be between 1 and 10';
                        }
                    }

                    if (values.type === 'sandwich') {
                        if (!values.slices_of_bread) {
                            errors.slices_of_bread_error = 'Slices of Bread is required';
                        } else if (Number(values.slices_of_bread) < 1) {
                            errors.slices_of_bread_error = 'Slices of Bread must be greater than 0';
                        }
                    }

                    return errors;
                }}
                onSubmit={handleSubmit}
            >
                <Form className="form">
                    <div className="form-group">
                        <label htmlFor="name">Name:</label>
                        <Field type="text" id="name" name="name" className="form-control" />
                        <ErrorMessage name="name" component="div" className="error" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="preparation_time">Preparation Time:</label>
                        <Field type="time" id="preparation_time" name="preparation_time" className="form-control"/>
                        <ErrorMessage name="preparation_time" component="div" className="error" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="type">Type:</label>
                        <Field as="select" id="type" name="type" className="form-control">
                            <option value="">Select</option>
                            <option value="pizza">Pizza</option>
                            <option value="soup">Soup</option>
                            <option value="sandwich">Sandwich</option>
                        </Field>
                        <ErrorMessage name="type" component="div" className="error" />
                    </div>
                    <ConditionalFields />
                    <button type="submit" className="btn btn-primary">
                        Submit
                    </button>
                    {renderSubmissionMessage()}
                </Form>
            </Formik>
        </div>
    );
};

export default DishForm;
