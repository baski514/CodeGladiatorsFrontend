import React from "react";
import { usePopperTooltip } from 'react-popper-tooltip';
import 'react-popper-tooltip/dist/styles.css';

const Tooltip = ({ children, tooltip, hideArrow, ...props }) =>{
    const popperOptions = {placement:'right'}
    const config = {closeOnOutsideClick:true,closeOnTriggerHidden:false,interactive:true,delayHide:20}
    const {
        getArrowProps,
        getTooltipProps,
        setTooltipRef,
        setTriggerRef,
        visible
      } = usePopperTooltip(config,popperOptions);
    
    return (
        <>
            <div ref={setTriggerRef}>
                {children}
            </div> 

            {visible && (
                <div
                    ref={setTooltipRef}
                    {...getTooltipProps({ className: 'tooltip-container' })}
                >
                    {tooltip}
                    <div {...getArrowProps({ className: 'tooltip-arrow' })} />
                </div>
            )}
        </>
    );
};

export default Tooltip;