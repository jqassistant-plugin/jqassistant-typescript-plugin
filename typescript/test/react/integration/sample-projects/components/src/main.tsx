/* eslint-disable */

import React, { ReactNode } from "react";

const SomeComponent = () => {
    return <div>Something</div>;
}

function BasicFunctionComponent() {
    return <></>;
}

const BasicArrowFunctionComponent = () => <></>;

class BasicClassComponent extends React.Component<unknown, {}> {
    public render(): ReactNode {
        return <></>;
    }
}

const ArrFuncComponentWithContent = () => {
    return <>
        <h1>Header</h1>
        <h2>SubHeader1</h2>
        <h2>SubHeader2</h2>
        <SomeComponent />
    </>;
}

class ClassComponentWithContent extends React.Component<unknown, {}> {
    public render(): ReactNode {
        return <>
            <h1>Header</h1>
            <div>
                <SomeComponent />
                <SomeComponent />
                <SomeComponent />
            </div>
        </>;
    }
}
