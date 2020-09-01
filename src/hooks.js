import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';

export const useInterval = (callback, delay) =>
{
    const savedCallback = useRef();

    const updateCallback = () => 
    {
        savedCallback.current = callback;
    }

    useEffect(updateCallback, [callback]);

    const updateInterval = () => 
    {
        const tick = () => 
        {
            savedCallback.current();
        }

        if (delay !== null) 
        {
            let id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }

    useEffect(updateInterval, [delay]);
}

export const useToggleableInterval = (active, callback, delay) =>
{
    const savedCallback = useRef();

    const updateCallback = () => 
    {
        savedCallback.current = callback;
    }

    useEffect(updateCallback, [callback]);

    let intervalId = null;

    const updateInterval = () => 
    {
        clearInterval(intervalId);
        if (active)
        {
            intervalId = setInterval(
                () => savedCallback.current(),
                delay
            );
            return () => clearInterval(intervalId);
        }
    }

    useEffect(updateInterval, [delay, active]);
}

export const useTimeoutDivResize = (divRef, before, after, delay) => 
{
    const savedCallbacks = useRef();

    const updateCallbacks = () => 
    {
        savedCallbacks.current = { before, after };
    }

    useEffect(updateCallbacks, [before, after]);

    let timeoutId = null;

    const resize = () =>
    {
        const afterTimeout = () =>
        {
            savedCallbacks.current.after();
            timeoutId = null;
        }

        const delayResize = () =>
        {
            if(timeoutId === null)
            {
                savedCallbacks.current.before();
            }
            else
            {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(afterTimeout, delay);
        }

        const observer = new ResizeObserver(delayResize);
        observer.observe(divRef.current);

        return () => 
        {
            clearTimeout(timeoutId);
            observer.unobserve(divRef.current);
        }
    }

    useEffect(resize, []);
}

export const useTimeoutWindowResize = (awaiting, complete, delay) => 
{
    const savedCallbacks = useRef();

    const updateCallbacks = () =>
    {
        savedCallbacks.current = { awaiting, complete };
    }

    useEffect(updateCallbacks, [awaiting, complete]);

    const windowResize = () =>
    {
        let timeoutId = null;

        const delayComplete = () =>
        {
            savedCallbacks.current.complete();
            timeoutId = null;
        }

        const delayResize = () => 
        {
            if(timeoutId === null)
            {
                savedCallbacks.current.awaiting();
            }
            else 
            {
                clearTimeout(timeoutId);
            }

            timeoutId = setTimeout(delayComplete, delay);
        }

        window.addEventListener('resize', delayResize);
        return () => window.removeEventListener('resize', delayResize);
    }
    

    useLayoutEffect(windowResize, [])
}