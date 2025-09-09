import { useState, useEffect } from 'react';

export const useEditableField = (
    initialValue: string,
    onSave: (newValue: string) => void
) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    const handleBlur = () => {
        // Trim and check for actual changes before saving
        const trimmedValue = value.trim();
        if (trimmedValue.length > 0 && trimmedValue !== initialValue) {
            onSave(trimmedValue);
        } else {
            setValue(initialValue); // Revert if invalid or unchanged
        }
        setIsEditing(false);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        // Correctly handle 'Enter' key submission for inputs, ignoring it for textareas.
        if (event.key === 'Enter' && event.currentTarget instanceof HTMLInputElement) {
             handleBlur();
        } else if (event.key === 'Escape') {
            setValue(initialValue);
            setIsEditing(false);
        }
    };

    const reset = (newValue: string) => {
        setValue(newValue);
        setIsEditing(false);
    };

    return {
        isEditing,
        setIsEditing,
        value,
        setValue,
        handleBlur,
        handleKeyDown,
        reset,
    };
};
