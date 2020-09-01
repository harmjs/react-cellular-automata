import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { COLOR, MARGIN_SIZE } from '../constants';

export const Spacer = styled.div`
    padding: ${MARGIN_SIZE.SMALL};
    box-sizing: border-box;
`;

export const Field = styled.form`
    padding: ${MARGIN_SIZE.SMALL};
    display: flex;
    flex-flow: column;
    border: 1px solid black;
    background-color: white;
`;

export const ButtonField = styled(Field)`
    border-radius: 8px;
`;

export const FieldLabel = styled.label`
    padding: 2px;
    font-family: monospace;
    font-size: 16px;
    font-weight: bold;
`;

const SelectField = styled.select`
    font-size: 14px;
`;

const TextInput = styled.input`
    min-width: 50px;
    font-size: 16px;
    font-family: monospace;
    padding: 2px;
    border: none;
`;

const ButtonInput = styled.input`
    text-align: center;
    min-width: 50px;
    border: none;
    font-size: 16px;
    font-family: monospace;
    background-color: white;
    cursor: pointer;
`;

const CheckboxInput = styled.input`
    text-align:left;
    width: auto;
    font-size: 16px;
`;


const BoolFields = styled.div`
    display: flex;
    padding: 1px;

`;

const BoolField = styled.div`
    display: flex;
    padding: 1px;
    align-items: center;
`;

const BoolLabel = styled.div`
    font-size: 16px;
    font-family: monospace;
`;


const RadioInput = styled.input`
    min-width: 50px;
`;

const ErrorDropdown = styled.div``;
const ErrorDropdownContent = styled.div``;

const RuleBools = styled.div`
    display: flex;
    flex-wrap: wrap;
`;

const RuleBool = styled.div`
    display: flex;
    flex-wrap: wrap;
    width: 30px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: ${({ color }) => color }};
    cursor: pointer;
    user-select: none; 
`;

const RuleBoolIndex = styled.div`
    font-size: 18px;
`;

export const RuleField = ({ label, rule, onClick, colors }) => 
{
    return (
        <Spacer>
            <Field>
                <FieldLabel>
                    {label}
                </FieldLabel>
                <RuleBools>
                    { rule.bools.map((bool, index) => (
                        <RuleBool
                            color={colors[+bool]}
                            index={index}
                            key={index}
                            active={bool}
                            onClick={() => onClick(index)}
                        >
                            <RuleBoolIndex>
                                {index}
                            </RuleBoolIndex>
                        </RuleBool>
                    ))}
                </RuleBools>
            </Field>
        </Spacer>
    );
}

const CUSTOM_PRESET = { name: "Custom" };

export const PresetSelectField = ({ current, label, 
    presets, onSubmit }) => 
{
    if(!current) current = CUSTOM_PRESET;

    const optionsMap = new Map([...presets, current]
        .map((option) => [option.name, option]));
    const options = Array.from(optionsMap.values());

    const handleChange = (event) => 
    {
        if(optionsMap.has(event.target.value))
        {
            onSubmit(optionsMap.get(event.target.value));
        }
    }

    return (
        <Spacer>
            <Field
                htmlFor={label}
            >
                <FieldLabel
                    htmlFor={label}
                >
                    {label}
                </FieldLabel>
                <SelectField 
                    id={label}
                    value={current.name}
                    onChange={handleChange}
                >
                    {options.map((option, index) => (
                        <option
                            key={index}
                            value={option.name}  
                        >
                            { option.name }
                        </option>
                    ))}
                </SelectField>
            </Field>
        </Spacer>
    );
}

export const TextField = ({ 
    label, 
    value, 
    valueToString = (value) => value, 
    stringToValue = (string) => string,
    onSubmit
}) =>
{
    const [string, setString] = useState(valueToString(value));

    useEffect(() => setString(valueToString(value)), []);

    const handleSubmit = (event) => {
        event.preventDefault();
        const nextValue = stringToValue(string);

        setString(valueToString(value));

        if(nextValue === null)
        {
            setString(valueToString(value));
        } 
        else 
        {
            setString(valueToString(nextValue))
            onSubmit(nextValue);
        }
    };

    const handleChange = (event) => 
    {
        setString(event.target.value);
    }

    return (
        <Spacer>
            <Field
                onSubmit={handleSubmit}
                htmlFor={label}>
                <FieldLabel
                    htmlFor={label}
                >
                    {label}
                </FieldLabel>
                <TextInput
                    onBlur={handleSubmit}
                    id={label}
                    value={string} 
                    onChange={handleChange}
                />
            </Field>
        </Spacer>
    );
}

export const Checkbox = ({ value, onSubmit, label }) =>
{

    return (
        <Spacer>
            <Field
                onSubmit={() => onSubmit(!value)}
                htmlFor={label}
            >
                <FieldLabel>
                    { label }
                </FieldLabel>
                <div>
                    <CheckboxInput
                        value={value}
                        type="checkbox"
                    />
                </div>
            </Field>
        </Spacer>

    )
}

/*
export const RadioField = ({ options, value, onSubmit, label }) => 
{
    return (
        <Spacer>
            <Field>
                <FieldLabel>
                    {label}
                </FieldLabel>
                <BoolFields>
                    { options.map((option, index) => (
                        <BoolField
                            key={index}
                        >
                            <BoolField
                                htmlFor={option.label}
                            >
                                { option.label }
                            </BoolField>
                            <RadioInput 
                                id={option.label}
                                type="radio"
                                checked={value === option.value}
                                onChange={() => onSubmit(option.value)}
                            />
                        </BoolField>  
                    ))}
                </BoolFields>
            </Field>
        </Spacer>
    );
}
*/



export const Button = ({ label, onSubmit }) => 
{
    function submit(event)
    {
        event.preventDefault();
        onSubmit();
    }

    return (
        <Spacer>
            <ButtonField
                onSubmit={submit}
            >
                <ButtonInput 
                    type="submit"
                    value={label}
                />
            </ButtonField>
        </Spacer>
    );
}
