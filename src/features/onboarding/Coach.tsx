/* Yılmaz Hoca: the guide who walks new visitors through the board.
   Drawn as one SVG so he scales cleanly; mouth, eyes and wave are CSS-animated. */

export default function Coach({ talking, waving }: { talking: boolean; waving: boolean }) {
  return (
    <svg className={`tour-coach-svg ${talking ? "is-talking" : ""} ${waving ? "is-waving" : ""}`} viewBox="0 0 170 215" aria-hidden="true">
      <defs>
        <linearGradient id="yhJacket" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#353A41" /><stop offset="1" stopColor="#1D2025" /></linearGradient>
        <linearGradient id="yhSleeve" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#30353B" /><stop offset="1" stopColor="#202328" /></linearGradient>
        <linearGradient id="yhSkin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#EDBF97" /><stop offset="1" stopColor="#D29A72" /></linearGradient>
        <linearGradient id="yhHair" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#B9BEC3" /><stop offset="1" stopColor="#7D838A" /></linearGradient>
        <linearGradient id="yhBeard" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#A9AEB4" /><stop offset="1" stopColor="#868C93" /></linearGradient>
        <radialGradient id="yhGlow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#4CBF52" stopOpacity="0.38" /><stop offset="1" stopColor="#4CBF52" stopOpacity="0" /></radialGradient>
      </defs>
      <circle className="tc-glow" cx="85" cy="124" r="82" fill="url(#yhGlow)" />
      <g className="tc-bob">
        {/* torso: training jacket */}
        <path d="M4 215 C4 162 34 138 85 138 C136 138 166 162 166 215 Z" fill="url(#yhJacket)" />
        <path d="M18 182 C24 158 46 146 66 141" stroke="#4CBF52" strokeWidth="3.4" fill="none" strokeLinecap="round" />
        <path d="M152 182 C146 158 124 146 104 141" stroke="#4CBF52" strokeWidth="3.4" fill="none" strokeLinecap="round" />
        {/* high collar + zip */}
        <path d="M62 140 C66 128 104 128 108 140 L102 156 C96 148 74 148 68 156 Z" fill="#2A2E34" stroke="#3E444B" strokeWidth="1" />
        <path d="M85 150 L85 215" stroke="#121417" strokeWidth="2.4" />
        <rect x="82.6" y="158" width="4.8" height="8" rx="1.4" fill="#C9CED3" />
        {/* chest crest */}
        <rect x="104" y="166" width="17" height="13" rx="2.5" fill="#3C9A43" />
        <path d="M106.5 172.5 H118.5 M112.5 168.5 V176.5" stroke="#fff" strokeWidth="1" />
        <rect x="106.5" y="168.5" width="12" height="8" fill="none" stroke="#fff" strokeWidth="1" />
        {/* neck */}
        <path d="M72 116 L72 136 C78 144 92 144 98 136 L98 116 Z" fill="#CF956D" />
        {/* lanyard + whistle */}
        <path d="M71 140 C74 176 96 176 99 140" stroke="#4CBF52" strokeWidth="2" fill="none" />
        <rect x="80" y="172" width="13" height="8" rx="3.5" fill="#D7DCE0" stroke="#9AA1A8" strokeWidth="1" />
        <circle cx="83.5" cy="176" r="1.3" fill="#5E656C" />
        <g transform="translate(0 7)">
          {/* ears */}
          <ellipse cx="52.5" cy="84" rx="5.5" ry="8" fill="#DCA67F" />
          <ellipse cx="117.5" cy="84" rx="5.5" ry="8" fill="#DCA67F" />
          {/* head */}
          <ellipse cx="85" cy="80" rx="32" ry="37" fill="url(#yhSkin)" />
          {/* short salt-and-pepper hair, side part */}
          <path d="M52 78 C47 48 64 32 86 32 C108 32 124 46 118 78 C116 64 112 56 104 52 C96 56 80 55 70 50 C61 56 55 64 52 78 Z" fill="url(#yhHair)" />
          <path d="M70 50 C78 46 92 45 104 52" stroke="#E2E5E8" strokeWidth="1.1" fill="none" strokeLinecap="round" opacity="0.4" />
          {/* trimmed grey beard */}
          <path d="M54 88 C55 112 68 124 85 124 C102 124 115 112 116 88 C112 98 106 104 100 106 C95 102 75 102 70 106 C64 104 58 98 54 88 Z" fill="url(#yhBeard)" />
          <path d="M71 100 C76 95 94 95 99 100 C95 99 89 99 85 101 C81 99 75 99 71 100 Z" fill="#8F959B" />
          {/* brows */}
          <path d="M65 70 C70 66 77 66 80 69" stroke="#6C7279" strokeWidth="3.2" fill="none" strokeLinecap="round" />
          <path d="M90 69 C93 66 100 66 105 70" stroke="#6C7279" strokeWidth="3.2" fill="none" strokeLinecap="round" />
          {/* eyes + smile lines */}
          <g className="tc-eyes">
            <ellipse cx="73" cy="80" rx="3.6" ry="4.2" fill="#2A211C" />
            <ellipse cx="97" cy="80" rx="3.6" ry="4.2" fill="#2A211C" />
            <circle cx="74.2" cy="78.6" r="1.2" fill="#fff" />
            <circle cx="98.2" cy="78.6" r="1.2" fill="#fff" />
          </g>
          <path d="M62 80 L59 78 M62 84 L59 85 M108 80 L111 78 M108 84 L111 85" stroke="#B9835E" strokeWidth="1.1" strokeLinecap="round" />
          {/* nose */}
          <path d="M85 82 C81 91 81 94 86 95" stroke="#BF8460" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* mouth */}
          <path className="tc-smile" d="M76 107 C81 112 89 112 94 107" stroke="#5B3226" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path className="tc-talk" d="M77 106 C80 115 90 115 93 106 C89 108.5 81 108.5 77 106 Z" fill="#5E2420" />
        </g>
        {/* left arm holding a tablet with a lineup */}
        <path d="M30 160 C20 172 20 192 28 208 L48 208 C46 190 50 176 58 166 Z" fill="url(#yhSleeve)" />
        <g transform="translate(6 152) rotate(-8 25 30)">
          <rect x="0" y="0" width="50" height="62" rx="6" fill="#16181B" stroke="#4A5057" strokeWidth="1.6" />
          <rect x="4" y="5" width="42" height="52" rx="2.5" fill="#3E8E41" />
          <path d="M4 31 H46" stroke="#fff" strokeWidth="1" opacity="0.8" />
          <circle cx="25" cy="31" r="6" fill="none" stroke="#fff" strokeWidth="1" opacity="0.8" />
          <rect x="15" y="5" width="20" height="7" fill="none" stroke="#fff" strokeWidth="1" opacity="0.8" />
          <circle cx="14" cy="20" r="2.4" fill="#fff" /><circle cx="25" cy="17" r="2.4" fill="#fff" /><circle cx="36" cy="20" r="2.4" fill="#fff" />
          <circle cx="18" cy="42" r="2.4" fill="#FF7A6B" /><circle cx="32" cy="42" r="2.4" fill="#FF7A6B" />
          <path d="M25 19 C29 26 31 33 31 38" stroke="#FFD54A" strokeWidth="1.2" fill="none" strokeDasharray="2 1.6" />
        </g>
        <circle cx="48" cy="198" r="7.5" fill="#DCA67F" />
        {/* right arm (waves) */}
        <g className="tc-wave">
          <path d="M134 162 C152 158 160 140 158 116" stroke="url(#yhSleeve)" strokeWidth="21" fill="none" strokeLinecap="round" />
          <path d="M149 150 C156 142 159 132 158 122" stroke="#4CBF52" strokeWidth="2.6" fill="none" strokeLinecap="round" opacity="0.9" />
          <circle cx="157" cy="104" r="10.5" fill="#DCA67F" />
          <ellipse cx="146.5" cy="106" rx="3.4" ry="6" fill="#DCA67F" transform="rotate(-24 146.5 106)" />
          <path d="M152 95 L152 90 M157 94 L158 88.5 M162 96 L164 91" stroke="#DCA67F" strokeWidth="4.2" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}

