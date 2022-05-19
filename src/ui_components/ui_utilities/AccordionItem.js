import React from "react";
import renderHTML from "react-render-html";

const AccordionItem = ({
    showDescription,
    ariaExpanded,
    fontWeightBold,
    item,
    index,
    onClick,
}) => (
    <div className="faq__question" key={item.Name}>
        <dt>
            <button
                aria-expanded={ariaExpanded}
                aria-controls={`faq${index + 1}_desc`}
                data-qa="faq__question-button"
                className={`theme-color font-bold faq__question-button ${fontWeightBold}`}
                onClick={onClick}
            >
                {item.Name}
            </button>
        </dt>
        <dd>
            <div
                id={`faq${index + 1}_desc`}
                data-qa="faq__desc"
                className={`faq__desc ${showDescription}`}
            >
                {renderHTML(item.Description__c ? item.Description__c : '')}
            </div>
        </dd>
    </div>
);

export default AccordionItem;
