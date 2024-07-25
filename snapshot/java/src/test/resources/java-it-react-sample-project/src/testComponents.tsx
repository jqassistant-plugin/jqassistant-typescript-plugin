/* eslint-disable */

import React, { ReactNode } from "react";

const SomeComponent = () => {
    return <div>Something</div>;
}

const ComponentWithContent = () => {
    const someHtml = <div>
        <button />
    </div>;

    return <>
        <h1>Header</h1>
        <h2>SubHeader1</h2>
        <h2>SubHeader2</h2>
        <div>
            <SomeComponent />
            <SomeComponent />
            <SomeComponent />
        </div>
        {someHtml}
    </>;
}
