import { Link } from 'react-router';

const buttonStyles =
  'bg-accent py-3.5 px-6 rounded-md text-black cursor-pointer font-semibold text-base transition-shadow hover:[box-shadow:0px_0px_10px_0px_#FFF9E9_inset,0px_2px_40px_0px_#FEC432]';

type ButtonAsButton = {
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  to?: never;
};

type ButtonAsLink = {
  onClick?: never;
  to: string;
};

type ButtonProps = (ButtonAsButton | ButtonAsLink) & {
  children: React.ReactNode;
};

function isLinkProps(props: ButtonAsButton | ButtonAsLink): props is ButtonAsLink {
  return 'to' in props && typeof props.to === 'string';
}

export default function Button({ children, ...props }: ButtonProps) {
  const commonProps = { className: buttonStyles, children };

  if (isLinkProps(props)) {
    return <Link to={props.to} {...commonProps} />;
  }

  const { type = 'button', onClick } = props;
  return <button type={type} onClick={onClick} {...commonProps} />;
}
