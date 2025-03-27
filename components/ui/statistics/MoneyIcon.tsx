import * as React from "react";
import { SvgXml } from "react-native-svg";

const moneyIconXml = `
<svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M8 16.5C10.1217 16.5 12.1566 15.6571 13.6569 14.1569C15.1571 12.6566 16 10.6217 16 8.5C16 6.37827 15.1571 4.34344 13.6569 2.84315C12.1566 1.34285 10.1217 0.5 8 0.5C5.87827 0.5 3.84344 1.34285 2.34315 2.84315C0.842855 4.34344 0 6.37827 0 8.5C0 10.6217 0.842855 12.6566 2.34315 14.1569C3.84344 15.6571 5.87827 16.5 8 16.5ZM9 3.5C9 3.23478 8.89464 2.98043 8.70711 2.79289C8.51957 2.60536 8.26522 2.5 8 2.5C7.73478 2.5 7.48043 2.60536 7.29289 2.79289C7.10536 2.98043 7 3.23478 7 3.5V3.592C6.40268 3.69833 5.83276 3.92344 5.324 4.254C4.602 4.734 4 5.509 4 6.5C4 7.49 4.602 8.265 5.324 8.746C5.804 9.066 6.378 9.291 7 9.408V11.349C6.609 11.222 6.32 11.032 6.157 10.845C6.0724 10.7412 5.96782 10.6554 5.84945 10.5928C5.73107 10.5302 5.60133 10.492 5.46791 10.4804C5.33449 10.4689 5.20012 10.4843 5.07276 10.5257C4.9454 10.5671 4.82765 10.6336 4.72649 10.7214C4.62534 10.8091 4.54284 10.9163 4.48389 11.0365C4.42494 11.1568 4.39075 11.2876 4.38334 11.4214C4.37592 11.5551 4.39544 11.6889 4.44073 11.8149C4.48602 11.941 4.55617 12.0566 4.647 12.155C5.209 12.804 6.06 13.231 7 13.408V13.5C7 13.7652 7.10536 14.0196 7.29289 14.2071C7.48043 14.3946 7.73478 14.5 8 14.5C8.26522 14.5 8.51957 14.3946 8.70711 14.2071C8.89464 14.0196 9 13.7652 9 13.5V13.408C9.59733 13.3017 10.1672 13.0766 10.676 12.746C11.398 12.266 12 11.491 12 10.5C12 9.51 11.398 8.735 10.676 8.254C10.1672 7.92344 9.59733 7.69833 9 7.592V5.651C9.391 5.778 9.68 5.968 9.843 6.155C9.92839 6.25631 10.0331 6.33965 10.1509 6.40016C10.2688 6.46067 10.3975 6.49716 10.5296 6.50749C10.6617 6.51783 10.7945 6.50182 10.9204 6.46038C11.0462 6.41894 11.1626 6.35291 11.2627 6.26612C11.3628 6.17932 11.4447 6.0735 11.5035 5.9548C11.5624 5.83609 11.5971 5.70688 11.6056 5.57465C11.6141 5.44243 11.5962 5.30984 11.553 5.18458C11.5098 5.05932 11.4422 4.94389 11.354 4.845C10.791 4.196 9.941 3.769 9 3.592V3.5Z" fill="#00BC0D"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M8 16.5C10.1217 16.5 12.1566 15.6571 13.6569 14.1569C15.1571 12.6566 16 10.6217 16 8.5C16 6.37827 15.1571 4.34344 13.6569 2.84315C12.1566 1.34285 10.1217 0.5 8 0.5C5.87827 0.5 3.84344 1.34285 2.34315 2.84315C0.842855 4.34344 0 6.37827 0 8.5C0 10.6217 0.842855 12.6566 2.34315 14.1569C3.84344 15.6571 5.87827 16.5 8 16.5ZM9 3.5C9 3.23478 8.89464 2.98043 8.70711 2.79289C8.51957 2.60536 8.26522 2.5 8 2.5C7.73478 2.5 7.48043 2.60536 7.29289 2.79289C7.10536 2.98043 7 3.23478 7 3.5V3.592C6.40268 3.69833 5.83276 3.92344 5.324 4.254C4.602 4.734 4 5.509 4 6.5C4 7.49 4.602 8.265 5.324 8.746C5.804 9.066 6.378 9.291 7 9.408V11.349C6.609 11.222 6.32 11.032 6.157 10.845C6.0724 10.7412 5.96782 10.6554 5.84945 10.5928C5.73107 10.5302 5.60133 10.492 5.46791 10.4804C5.33449 10.4689 5.20012 10.4843 5.07276 10.5257C4.9454 10.5671 4.82765 10.6336 4.72649 10.7214C4.62534 10.8091 4.54284 10.9163 4.48389 11.0365C4.42494 11.1568 4.39075 11.2876 4.38334 11.4214C4.37592 11.5551 4.39544 11.6889 4.44073 11.8149C4.48602 11.941 4.55617 12.0566 4.647 12.155C5.209 12.804 6.06 13.231 7 13.408V13.5C7 13.7652 7.10536 14.0196 7.29289 14.2071C7.48043 14.3946 7.73478 14.5 8 14.5C8.26522 14.5 8.51957 14.3946 8.70711 14.2071C8.89464 14.0196 9 13.7652 9 13.5V13.408C9.59733 13.3017 10.1672 13.0766 10.676 12.746C11.398 12.266 12 11.491 12 10.5C12 9.51 11.398 8.735 10.676 8.254C10.1672 7.92344 9.59733 7.69833 9 7.592V5.651C9.391 5.778 9.68 5.968 9.843 6.155C9.92839 6.25631 10.0331 6.33965 10.1509 6.40016C10.2688 6.46067 10.3975 6.49716 10.5296 6.50749C10.6617 6.51783 10.7945 6.50182 10.9204 6.46038C11.0462 6.41894 11.1626 6.35291 11.2627 6.26612C11.3628 6.17932 11.4447 6.0735 11.5035 5.9548C11.5624 5.83609 11.5971 5.70688 11.6056 5.57465C11.6141 5.44243 11.5962 5.30984 11.553 5.18458C11.5098 5.05932 11.4422 4.94389 11.354 4.845C10.791 4.196 9.941 3.769 9 3.592V3.5Z" fill="url(#paint0_linear_154_755)" fill-opacity="0.2" style="mix-blend-mode:plus-lighter"/>
<defs>
<linearGradient id="paint0_linear_154_755" x1="8" y1="0.5" x2="8" y2="16.5" gradientUnits="userSpaceOnUse">
<stop stop-color="white" stop-opacity="0"/>
<stop offset="1" stop-color="#CBCBCB"/>
</linearGradient>
</defs>
</svg>
`;

export interface MoneyIconProps {
	width?: number;
	height?: number;
}

export const MoneyIcon: React.FC<MoneyIconProps> = ({
	width = 16,
	height = 17,
}) => {
	return <SvgXml xml={moneyIconXml} width={width} height={height} />;
};
