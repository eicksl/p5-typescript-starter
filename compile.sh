#!/bin/bash
if tsc; then
    if tslint -p .; then
        echo "Build successful. No TSLint errors.";
    else
        echo "Build successful; however, TSLint returned errors."
    fi
fi
