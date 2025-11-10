import React, { useState, useMemo } from 'react';

const DoorPanelCalculator = () => {
  const [doorWidth, setDoorWidth] = useState(103);
  const [doorHeight, setDoorHeight] = useState(201);
  const [edgeDistance, setEdgeDistance] = useState(15);
  const [panelGap, setPanelGap] = useState(10);
  const [panelCount, setPanelCount] = useState(2);
  const [proportionType, setProportionType] = useState('golden');
  const [showPeephole, setShowPeephole] = useState(false);
  const [peepholeTop, setPeepholeTop] = useState(45);
  const [peepholeHeight, setPeepholeHeight] = useState(6);
  const [isProportionsCollapsed, setIsProportionsCollapsed] = useState(false);
  const [autoCalculateSpacing, setAutoCalculateSpacing] = useState(false);

  const calculations = useMemo(() => {
    const phi = (1 + Math.sqrt(5)) / 2;

    // Auto-calculate spacing based on golden ratio if enabled
    let calculatedEdgeDistance = edgeDistance;
    let calculatedPanelGap = panelGap;

    if (autoCalculateSpacing) {
      // Calculate spacing where panel AREA : negative space AREA = φ : 1 (golden ratio)
      // We want: totalPanelArea / negativeSpaceArea = φ
      // Also maintain: gap = edge / φ (so gaps relate to edges by golden ratio)

      // Let edge = e, gap = g = e/φ
      // Panel width = W - 2e
      // Panel height total = H - 2e - (n-1)g = H - 2e - (n-1)e/φ
      // Panel area = (W - 2e) × [H - 2e - (n-1)e/φ]
      //
      // Negative space area = Total area - Panel area
      //                     = WH - (W - 2e)[H - 2e - (n-1)e/φ]
      //
      // We want: Panel area / Negative area = φ
      // So: Panel area = φ × Negative area
      // And: Panel area + Negative area = WH
      // Therefore: Panel area = φ/(1+φ) × WH  (since Panel = φ×Negative and Panel+Negative=WH)
      //
      // So: (W - 2e) × [H - 2e - (n-1)e/φ] = φ/(1+φ) × WH

      // Simplified approach: solve iteratively or use approximation
      // Let's expand and solve for e:
      // Let k = 2 + (panelCount-1)/φ
      // Panel height = H - ke
      // Panel area = (W - 2e)(H - ke)
      // We want: (W - 2e)(H - ke) = φ/(1+φ) × WH

      // This is a quadratic in e. Let's solve:
      // (W - 2e)(H - ke) = φ/(1+φ) × WH
      // WH - kWe - 2He + 2ke² = φWH/(1+φ)
      // 2ke² - (kW + 2H)e + WH - φWH/(1+φ) = 0
      // 2ke² - (kW + 2H)e + WH/(1+φ) = 0

      const k = 2 + (panelCount - 1) / phi;
      const targetPanelRatio = phi / (1 + phi); // ≈ 0.618

      const a = 2 * k;
      const b = -(k * doorWidth + 2 * doorHeight);
      const c = doorWidth * doorHeight / (1 + phi);

      // Quadratic formula: e = [-b ± sqrt(b² - 4ac)] / 2a
      const discriminant = b * b - 4 * a * c;

      if (discriminant >= 0) {
        const e1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const e2 = (-b - Math.sqrt(discriminant)) / (2 * a);

        // Choose the smaller positive solution that makes sense
        calculatedEdgeDistance = Math.max(0, Math.min(e1, e2));

        // Ensure it's reasonable (not too large)
        const maxEdge = Math.min(doorWidth / 6, doorHeight / 8);
        if (calculatedEdgeDistance > maxEdge || calculatedEdgeDistance < 1) {
          calculatedEdgeDistance = maxEdge;
        }
      } else {
        // Fallback if no solution
        calculatedEdgeDistance = Math.min(doorWidth, doorHeight) / 10;
      }

      calculatedPanelGap = calculatedEdgeDistance / phi;
    }

    const availableWidth = doorWidth - (2 * calculatedEdgeDistance);
    const availableHeight = doorHeight - (2 * calculatedEdgeDistance);
    const totalGaps = (panelCount - 1) * calculatedPanelGap;
    const availableHeightForPanels = availableHeight - totalGaps;

    // Define proportion ratios for different arrangements
    const getProportionRatios = (count, type) => {
      if (count < 1) return [1];

      // Generate ratios dynamically for any panel count
      switch (type) {
        case 'equal':
          return Array(count).fill(1);

        case 'golden':
          // Golden progression: 1, φ, φ², φ³, ...
          return Array.from({ length: count }, (_, i) => Math.pow(phi, i));

        case 'reverse':
          // Reverse golden progression: φⁿ⁻¹, φⁿ⁻², ..., φ, 1
          return Array.from({ length: count }, (_, i) => Math.pow(phi, count - 1 - i));

        case 'classic':
          // Symmetric pattern: small edges, larger middle
          if (count === 1) return [1];
          if (count === 2) return [1, 2];
          // For 3+: gradually increase to middle, then decrease
          const half = Math.floor(count / 2);
          const pattern = [];
          for (let i = 0; i < count; i++) {
            const distFromEdge = Math.min(i, count - 1 - i);
            pattern.push(distFromEdge + 1);
          }
          return pattern;

        case 'fibonacci':
          // Fibonacci sequence: 1, 1, 2, 3, 5, 8, 13, ...
          const fib = [1, 1];
          for (let i = 2; i < count; i++) {
            fib.push(fib[i - 1] + fib[i - 2]);
          }
          return fib.slice(0, count);

        default:
          return Array(count).fill(1);
      }
    };

    const heightRatios = getProportionRatios(panelCount, proportionType);
    const totalRatio = heightRatios.reduce((sum, ratio) => sum + ratio, 0);
    const normalizedRatios = heightRatios.map(ratio => ratio / totalRatio);
    
    // Calculate individual panel heights
    const panelHeights = normalizedRatios.map(ratio => ratio * availableHeightForPanels);
    const panelWidth = availableWidth;
    
    const totalUsedHeight = panelHeights.reduce((sum, h) => sum + h, 0) + totalGaps;
    const fits = totalUsedHeight <= availableHeight;

    // Calculate panel positions and peephole conflicts
    let currentY = edgeDistance;
    const panelPositions = [];
    const peepholeConflicts = [];

    if (showPeephole) {
      const peepholeBottom = peepholeTop + peepholeHeight;
      const peepholeCenter = peepholeTop + peepholeHeight / 2;

      for (let i = 0; i < panelHeights.length; i++) {
        const panelTop = currentY;
        const panelBottom = currentY + panelHeights[i];
        panelPositions.push({ top: panelTop, bottom: panelBottom, height: panelHeights[i] });

        // Check peephole conflicts
        let conflict = null;
        if (peepholeTop >= panelTop && peepholeBottom <= panelBottom) {
          const distFromTop = peepholeCenter - panelTop;
          const distFromBottom = panelBottom - peepholeCenter;
          const minDist = Math.min(distFromTop, distFromBottom);
          conflict = {
            type: minDist < 10 ? 'too-close-to-edge' : 'inside-safe',
            distance: minDist,
            message: minDist < 10 ? `Too close to edge (${minDist.toFixed(1)}cm)` : `Safely centered (${minDist.toFixed(1)}cm from edge)`
          };
        } else if ((peepholeTop < panelBottom && peepholeBottom > panelTop)) {
          const distFromTop = Math.abs(peepholeCenter - panelTop);
          const distFromBottom = Math.abs(peepholeCenter - panelBottom);
          const minDist = Math.min(distFromTop, distFromBottom);
          conflict = {
            type: 'on-edge',
            distance: minDist,
            message: `On panel edge (${minDist.toFixed(1)}cm away) - BAD!`
          };
        }

        peepholeConflicts.push(conflict);
        currentY = panelBottom + calculatedPanelGap;
      }
    }

    // Calculate areas for verification
    const totalDoorArea = doorWidth * doorHeight;
    const totalPanelArea = panelHeights.reduce((sum, h) => sum + h * panelWidth, 0);

    // Negative space = total door area - panel area
    const negativeSpaceArea = totalDoorArea - totalPanelArea;

    // Calculate the ratio: should be φ when auto-calculate is enabled
    const actualRatio = totalPanelArea / negativeSpaceArea;
    const ratioError = Math.abs(actualRatio - phi) / phi * 100; // Error percentage

    // Break down negative space
    const edgeArea = (2 * calculatedEdgeDistance * doorWidth) + // top and bottom edges
                     (2 * calculatedEdgeDistance * doorHeight) - // left and right edges
                     (4 * calculatedEdgeDistance * calculatedEdgeDistance); // corners counted twice
    const gapArea = totalGaps * panelWidth;
    const remainingNegativeSpace = negativeSpaceArea - edgeArea - gapArea;

    return {
      phi,
      availableWidth,
      availableHeight,
      availableHeightForPanels,
      panelWidth,
      panelHeights,
      heightRatios,
      totalUsedHeight,
      fits,
      totalGaps,
      panelPositions,
      peepholeConflicts,
      calculatedEdgeDistance,
      calculatedPanelGap,
      // Verification data
      totalDoorArea,
      totalPanelArea,
      negativeSpaceArea,
      actualRatio,
      ratioError,
      edgeArea,
      gapArea,
      remainingNegativeSpace
    };
  }, [doorWidth, doorHeight, edgeDistance, panelGap, panelCount, proportionType, showPeephole, peepholeTop, peepholeHeight, autoCalculateSpacing]);

  // Scale factor for visualization
  const scale = 380 / doorWidth;
  const scaledDoorWidth = doorWidth * scale;
  const scaledDoorHeight = doorHeight * scale;

  const getProportionDescription = (type) => {
    const descriptions = {
      equal: 'All panels same height',
      golden: 'Golden progression (1, φ, φ², φ³, ...)',
      classic: 'Symmetric proportions (larger in middle)',
      reverse: 'Reverse golden progression (largest at top)',
      fibonacci: 'Fibonacci sequence (1, 1, 2, 3, 5, 8, ...)'
    };
    return descriptions[type] || '';
  };

  const availableProportions = useMemo(() => {
    return ['equal', 'golden', 'classic', 'reverse', 'fibonacci'];
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Door Panel Calculator</h1>
      
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Door Dimensions</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Width (cm)</label>
                <input
                  type="number"
                  value={doorWidth}
                  onChange={(e) => setDoorWidth(Number(e.target.value))}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Height (cm)</label>
                <input
                  type="number"
                  value={doorHeight}
                  onChange={(e) => setDoorHeight(Number(e.target.value))}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Panel Configuration</h2>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Panel Count</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={panelCount}
                  onChange={(e) => setPanelCount(Number(e.target.value))}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Edge Distance (cm)</label>
                <input
                  type="number"
                  value={autoCalculateSpacing ? calculations.calculatedEdgeDistance.toFixed(1) : edgeDistance}
                  onChange={(e) => setEdgeDistance(Number(e.target.value))}
                  disabled={autoCalculateSpacing}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Panel Gap (cm)</label>
                <input
                  type="number"
                  value={autoCalculateSpacing ? calculations.calculatedPanelGap.toFixed(1) : panelGap}
                  onChange={(e) => setPanelGap(Number(e.target.value))}
                  disabled={autoCalculateSpacing}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoCalculateSpacing"
                  checked={autoCalculateSpacing}
                  onChange={(e) => setAutoCalculateSpacing(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="autoCalculateSpacing" className="text-sm font-medium">
                  Auto-calculate spacing using golden ratio
                </label>
              </div>
              <p className="text-xs text-gray-600 mt-1 ml-6">
                Automatically determines edge distance and panel gaps to achieve golden ratio proportions for the entire door layout
              </p>
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id="showPeephole"
                  checked={showPeephole}
                  onChange={(e) => setShowPeephole(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="showPeephole" className="font-medium">Show Peephole Cutout</label>
              </div>
              {showPeephole && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Distance from Top (cm)</label>
                    <input
                      type="number"
                      value={peepholeTop}
                      onChange={(e) => setPeepholeTop(Number(e.target.value))}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Peephole Height (cm)</label>
                    <input
                      type="number"
                      value={peepholeHeight}
                      onChange={(e) => setPeepholeHeight(Number(e.target.value))}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <div 
              className="flex items-center justify-between cursor-pointer mb-4"
              onClick={() => setIsProportionsCollapsed(!isProportionsCollapsed)}
            >
              <h2 className="text-xl font-semibold">Height Proportions</h2>
              <div className={`transform transition-transform duration-200 ${isProportionsCollapsed ? 'rotate-180' : ''}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {!isProportionsCollapsed && (
              <div className="space-y-3">
                {availableProportions.map(prop => (
                  <label key={prop} className="flex items-center">
                    <input
                      type="radio"
                      name="proportion"
                      value={prop}
                      checked={proportionType === prop}
                      onChange={(e) => setProportionType(e.target.value)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <span className="font-medium capitalize">{prop}</span>
                      <div className="text-sm text-gray-600 mt-1">
                        {getProportionDescription(prop)}
                      </div>
                      {proportionType === prop && (
                        <div className="text-xs text-gray-500 mt-1">
                          Ratios: {calculations.heightRatios.map(r => r.toFixed(2)).join(' : ')}
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Panel Specifications</h2>
            <div className="space-y-3">
              <p><strong>Panel width:</strong> {calculations.panelWidth.toFixed(1)} cm (all panels)</p>
              <div>
                <strong>Panel heights:</strong>
                {calculations.panelHeights.map((height, index) => (
                  <div key={index} className="ml-4 text-sm flex justify-between items-center">
                    <span>Panel {index + 1}: {height.toFixed(1)} cm</span>
                    {showPeephole && calculations.peepholeConflicts[index] && (
                      <span className={`text-xs px-2 py-1 rounded ${
                        calculations.peepholeConflicts[index].type === 'inside-safe' ? 'bg-green-100 text-green-700' :
                        calculations.peepholeConflicts[index].type === 'too-close-to-edge' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {calculations.peepholeConflicts[index].type === 'inside-safe' ? '✓ Safe' :
                         calculations.peepholeConflicts[index].type === 'too-close-to-edge' ? '⚠ Close' :
                         '✗ Edge'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <p><strong>Golden ratio (φ):</strong> {calculations.phi.toFixed(4)}</p>
              <p><strong>Total used height:</strong> {calculations.totalUsedHeight.toFixed(1)} / {calculations.availableHeight} cm</p>
              {calculations.fits ?
                <p className="text-green-600 font-medium">✓ All panels fit perfectly</p> :
                <p className="text-red-600 font-medium">⚠️ Panels don't fit - reduce panel count or gaps</p>
              }
            </div>
          </div>

          {autoCalculateSpacing && (
            <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200">
              <h2 className="text-xl font-semibold mb-4 text-purple-900">Golden Ratio Verification</h2>
              <div className="space-y-3 text-sm">
                <div className="bg-white p-3 rounded">
                  <p className="font-medium mb-2">Area Breakdown:</p>
                  <p className="ml-4">• Total door area: {calculations.totalDoorArea.toFixed(1)} cm²</p>
                  <p className="ml-4">• Panel area: {calculations.totalPanelArea.toFixed(1)} cm² ({(calculations.totalPanelArea / calculations.totalDoorArea * 100).toFixed(1)}%)</p>
                  <p className="ml-4">• Negative space: {calculations.negativeSpaceArea.toFixed(1)} cm² ({(calculations.negativeSpaceArea / calculations.totalDoorArea * 100).toFixed(1)}%)</p>
                </div>

                <div className="bg-white p-3 rounded">
                  <p className="font-medium mb-2">Negative Space Breakdown:</p>
                  <p className="ml-4">• Edge frame area: {calculations.edgeArea.toFixed(1)} cm²</p>
                  <p className="ml-4">• Panel gaps area: {calculations.gapArea.toFixed(1)} cm²</p>
                  <p className="ml-4">• Other space: {calculations.remainingNegativeSpace.toFixed(1)} cm²</p>
                </div>

                <div className="bg-white p-3 rounded">
                  <p className="font-medium mb-2">Golden Ratio Check:</p>
                  <p className="ml-4">• Target ratio (φ): {calculations.phi.toFixed(6)}</p>
                  <p className="ml-4">• Actual ratio (Panel/Negative): {calculations.actualRatio.toFixed(6)}</p>
                  <p className={`ml-4 font-medium ${calculations.ratioError < 1 ? 'text-green-600' : calculations.ratioError < 5 ? 'text-yellow-600' : 'text-red-600'}`}>
                    • Error: {calculations.ratioError.toFixed(2)}%
                    {calculations.ratioError < 1 ? ' ✓ Excellent!' : calculations.ratioError < 5 ? ' ⚠ Close' : ' ✗ Needs adjustment'}
                  </p>
                </div>

                <div className="bg-purple-100 p-3 rounded">
                  <p className="text-xs text-purple-900">
                    <strong>Note:</strong> When auto-calculate is enabled, the panel area should be φ times (≈1.618×) the negative space area, creating harmonious golden ratio proportions for the entire door.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Visualization */}
        <div className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Door Visualization</h2>
          <div className="flex justify-center">
            <svg 
              width={scaledDoorWidth + 40} 
              height={scaledDoorHeight + 40}
              className="border border-gray-300 bg-white rounded shadow-lg"
            >
              {/* Door outline */}
              <rect
                x="20"
                y="20"
                width={scaledDoorWidth}
                height={scaledDoorHeight}
                fill="#8B4513"
                stroke="#654321"
                strokeWidth="3"
              />
              
              {/* Available area (minus edge distance) */}
              <rect
                x={20 + calculations.calculatedEdgeDistance * scale}
                y={20 + calculations.calculatedEdgeDistance * scale}
                width={calculations.availableWidth * scale}
                height={calculations.availableHeight * scale}
                fill="none"
                stroke="#999"
                strokeWidth="1"
                strokeDasharray="5,5"
              />

              {/* Panels */}
              {calculations.fits && calculations.panelHeights.map((height, index) => {
                const panelY = 20 + calculations.calculatedEdgeDistance * scale +
                  calculations.panelHeights.slice(0, index).reduce((sum, h) => sum + h, 0) * scale +
                  index * calculations.calculatedPanelGap * scale;

                // Different colors for visual distinction
                const colors = ['#F5DEB3', '#DEB887', '#D2B48C', '#CDAA3D', '#DAA520'];
                const strokeColors = ['#D2691E', '#CD853F', '#A0522D', '#B8860B', '#B8860B'];

                return (
                  <g key={index}>
                    <rect
                      x={20 + calculations.calculatedEdgeDistance * scale}
                      y={panelY}
                      width={calculations.panelWidth * scale}
                      height={height * scale}
                      fill={colors[index % colors.length]}
                      stroke={strokeColors[index % strokeColors.length]}
                      strokeWidth="2"
                    />
                    {/* Panel number label */}
                    <text
                      x={20 + calculations.calculatedEdgeDistance * scale + (calculations.panelWidth * scale) / 2}
                      y={panelY + (height * scale) / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="12"
                      fill="#8B4513"
                      fontWeight="bold"
                    >
                      {index + 1}
                    </text>
                  </g>
                );
              })}

              {/* Peephole */}
              {showPeephole && (
                <g>
                  {/* Peephole cutout */}
                  <rect
                    x={20 + (doorWidth / 2 - 1) * scale} // 2cm wide, centered
                    y={20 + peepholeTop * scale}
                    width={2 * scale}
                    height={peepholeHeight * scale}
                    fill="#000"
                    stroke="#666"
                    strokeWidth="1"
                  />
                  {/* Peephole label */}
                  <text
                    x={20 + (doorWidth / 2 + 3) * scale}
                    y={20 + (peepholeTop + peepholeHeight/2) * scale}
                    fontSize="10"
                    fill="#666"
                    dominantBaseline="middle"
                  >
                    Peephole
                  </text>
                </g>
              )}

              {/* Door handle */}
              <circle
                cx={20 + scaledDoorWidth - 15}
                cy={20 + scaledDoorHeight / 2}
                r="5"
                fill="#FFD700"
                stroke="#DAA520"
                strokeWidth="2"
              />
              
              {/* Door hinges */}
              <rect x="22" y={20 + 30} width="8" height="15" fill="#C0C0C0" stroke="#A0A0A0" strokeWidth="1" />
              <rect x="22" y={20 + scaledDoorHeight - 45} width="8" height="15" fill="#C0C0C0" stroke="#A0A0A0" strokeWidth="1" />
            </svg>
          </div>
          
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium mb-2">Legend</h3>
              <div className="space-y-1 text-gray-600">
                <p>🟫 Door frame</p>
                <p>⬜ Decorative panels</p>
                <p>- - - Available area</p>
                <p>🟡 Door handle</p>
                <p>⬜ Hinges</p>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Design Notes</h3>
              <div className="space-y-1 text-gray-600 text-xs">
                <p>• All panels same width</p>
                <p>• Heights follow proportion ratios</p>
                <p>• Golden ratio creates harmony</p>
                <p>• Traditional door aesthetics</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoorPanelCalculator;