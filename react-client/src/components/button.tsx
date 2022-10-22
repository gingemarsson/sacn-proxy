import React, { ReactNode } from 'react';
import styles from './Button.module.scss';

type Props = {
    onClick: () => void;
    isSideButton?: boolean;
    isHighlighted?: boolean;
    children?: ReactNode;
    color?: string;
    tooltip?: string;
};

const Button: React.FC<Props> = ({
    children,
    onClick,
    color,
    isSideButton = false,
    isHighlighted = false,
    tooltip,
}: Props) => {
    return (
        <button
            style={color ? { backgroundColor: color } : {}}
            className={
                styles.button +
                ' ' +
                (isSideButton ? ' ' + styles.sideButton : '') +
                ' ' +
                (isHighlighted ? ' ' + styles.highlighted : '')
            }
            onClick={onClick}
            title={tooltip}
        >
            {children}
        </button>
    );
};

export default Button;
