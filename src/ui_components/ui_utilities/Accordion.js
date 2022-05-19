import React, { useState } from "react";
import AccordionItem from "./AccordionItem";
import "../../styles/accordion.css";

const Accordion = ({ questionsAnswers }) => {
    const [activeIndex, setActiveIndex] = useState(1);

    const renderedQuestionsAnswers = questionsAnswers.map((item, index) => {
        const showDescription = index === activeIndex ? "show-description" : "";
        const fontWeightBold = index === activeIndex ? "font-weight-bold" : "";
        const ariaExpanded = index === activeIndex ? "true" : "false";
        return (
            <AccordionItem
                showDescription={showDescription}
                fontWeightBold={fontWeightBold}
                ariaExpanded={ariaExpanded}
                item={item}
                index={index}
                onClick={() => {
                    setActiveIndex(index);
                }}
                key={index}
            />
        );
    });

    return (
        <div className="faq">
            <h1 className="faq__title text-2xl">Course Offerings</h1>
            <dl className="faq__list mt-4">{renderedQuestionsAnswers}</dl>
        </div>
    );
};

export default Accordion;
