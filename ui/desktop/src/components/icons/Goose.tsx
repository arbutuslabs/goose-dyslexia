import LogoInline from '../../images/logo-inline.png';

export function Goose({ className = '' }) {
  return (
    <img
      src={LogoInline}
      alt="Lira"
      className={className}
      draggable={false}
    />
  );
}

export function Rain({ className = '' }) {
  return (
    <svg
      width="103"
      height="103"
      viewBox="0 0 103 103"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g className="animate-[wind_2s_linear_infinite]">
        <circle cx="80" cy="20" r="2" fill="currentColor" opacity="0.4" />
        <circle cx="70" cy="35" r="1.5" fill="currentColor" opacity="0.3" />
        <circle cx="90" cy="40" r="1" fill="currentColor" opacity="0.3" />
      </g>
      <g className="animate-[wind_2s_linear_1s_infinite]">
        <circle cx="85" cy="25" r="1.5" fill="currentColor" opacity="0.3" />
        <circle cx="75" cy="30" r="1" fill="currentColor" opacity="0.4" />
        <circle cx="95" cy="15" r="2" fill="currentColor" opacity="0.3" />
      </g>
    </svg>
  );
}
