import React, { useState, useMemo } from 'react';

const DoorPanelCalculator = () => {
  const [doorWidth, setDoorWidth] = useState(103);
  const [doorHeight, setDoorHeight] = useState(203);
  const [edgeDistance, setEdgeDistance] = useState(15);
  const [panelGap, setPanelGap] = useState(10);
  const [panelCount, setPanelCount] = useState(2);
  const [proportionType, setProportionType] = useState('golden');
  const [showPeephole, setShowPeephole] = useState(false);
  const [peepholeTop, setPeepholeTop] = useState(45);
  const [peepholeDiameter, setPeepholeDiameter] = useState(6);
  const [minEdgeDistance, setMinEdgeDistance] = useState(2);
  const [autoCenterPeephole, setAutoCenterPeephole] = useState(false);
  const [preferGapPlacement, setPreferGapPlacement] = useState(false);
  const [isProportionsCollapsed, setIsProportionsCollapsed] = useState(false);
  const [autoCalculateSpacing, setAutoCalculateSpacing] = useState(false);
  const [spacingRatioType, setSpacingRatioType] = useState('golden');

  // Define available ratios with their values and descriptions
  const ratioTypes = {
    golden: {
      value: (1 + Math.sqrt(5)) / 2,
      name: 'Golden Ratio (φ)',
      description: 'Most famous in architecture. Used in Greek temples, Renaissance art, and classical door designs. Creates the most aesthetically pleasing proportions.',
      usage: 'Recommended for classical and high-end doors'
    },
    sqrt2: {
      value: Math.sqrt(2),
      name: '√2 Ratio',
      description: 'Used in ISO paper sizes (A4, etc.) and traditional Japanese architecture. Creates balanced, practical proportions.',
      usage: 'Common in modern minimalist doors'
    },
    '3:2': {
      value: 1.5,
      name: '3:2 Ratio',
      description: 'Classic photography ratio. Simple, harmonious proportions widely used in traditional craftsmanship and panel doors.',
      usage: 'Very common in residential doors'
    },
    '4:3': {
      value: 4/3,
      name: '4:3 Ratio',
      description: 'Traditional screen format. Provides slightly squarer panels, creating a more conservative, stable appearance.',
      usage: 'Traditional and conservative door styles'
    },
    silver: {
      value: 1 + Math.sqrt(2),
      name: 'Silver Ratio (δₛ)',
      description: 'Less known than golden ratio but equally elegant. Found in paper sizes and some Japanese temple proportions. Creates more dramatic proportions with larger panels.',
      usage: 'For bold, dramatic door designs with prominent panels'
    }
  };

  const calculations = useMemo(() => {
    const phi = (1 + Math.sqrt(5)) / 2;
    const targetRatio = autoCalculateSpacing ? ratioTypes[spacingRatioType].value : phi;

    // Auto-calculate spacing based on golden ratio if enabled
    let calculatedEdgeDistance = edgeDistance;
    let calculatedPanelGap = panelGap;

    if (autoCalculateSpacing) {
      // Calculate spacing where panel AREA : negative space AREA = targetRatio : 1
      // We want: totalPanelArea / negativeSpaceArea = targetRatio
      // Also maintain: gap = edge / targetRatio (so gaps relate to edges by the chosen ratio)

      // Let edge = e, gap = g = e/ratio
      // Panel width = W - 2e
      // Panel height total = H - 2e - (n-1)g = H - 2e - (n-1)e/ratio
      // Panel area = (W - 2e) × [H - 2e - (n-1)e/ratio]
      //
      // Negative space area = Total area - Panel area
      //                     = WH - (W - 2e)[H - 2e - (n-1)e/ratio]
      //
      // We want: Panel area / Negative area = ratio
      // So: Panel area = ratio × Negative area
      // And: Panel area + Negative area = WH
      // Therefore: Panel area = ratio/(1+ratio) × WH  (since Panel = ratio×Negative and Panel+Negative=WH)
      //
      // So: (W - 2e) × [H - 2e - (n-1)e/ratio] = ratio/(1+ratio) × WH

      // Simplified approach: solve iteratively or use approximation
      // Let's expand and solve for e:
      // Let k = 2 + (panelCount-1)/ratio
      // Panel height = H - ke
      // Panel area = (W - 2e)(H - ke)
      // We want: (W - 2e)(H - ke) = ratio/(1+ratio) × WH

      // This is a quadratic in e. Let's solve:
      // (W - 2e)(H - ke) = ratio/(1+ratio) × WH
      // WH - kWe - 2He + 2ke² = ratio×WH/(1+ratio)
      // 2ke² - (kW + 2H)e + WH - ratio×WH/(1+ratio) = 0
      // 2ke² - (kW + 2H)e + WH/(1+ratio) = 0

      const k = 2 + (panelCount - 1) / targetRatio;
      const targetPanelRatio = targetRatio / (1 + targetRatio);

      const a = 2 * k;
      const b = -(k * doorWidth + 2 * doorHeight);
      const c = doorWidth * doorHeight / (1 + targetRatio);

      // Quadratic formula: e = [-b ± sqrt(b² - 4ac)] / 2a
      const discriminant = b * b - 4 * a * c;

      if (discriminant >= 0) {
        const e1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const e2 = (-b - Math.sqrt(discriminant)) / (2 * a);

        // Choose the smaller positive solution
        calculatedEdgeDistance = Math.min(Math.abs(e1), Math.abs(e2));

        // Sanity check: ensure it's positive and reasonable
        if (calculatedEdgeDistance < 1 || calculatedEdgeDistance > doorHeight / 3) {
          // If unreasonable, use a conservative fallback that guarantees fit
          // Allocate 10% to edges and calculate gap to fit panels
          calculatedEdgeDistance = doorHeight * 0.05;
        }
      } else {
        // No mathematical solution exists - use conservative fallback
        calculatedEdgeDistance = doorHeight * 0.05;
      }

      calculatedPanelGap = calculatedEdgeDistance / targetRatio;
    }

    const availableWidth = doorWidth - (2 * calculatedEdgeDistance);
    const availableHeight = doorHeight - (2 * calculatedEdgeDistance);
    const totalGaps = (panelCount - 1) * calculatedPanelGap;
    const availableHeightForPanels = Math.max(0, availableHeight - totalGaps);

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
    // When auto-calculate is on, panels always fit by design. Only check fit for manual mode.
    // Add small epsilon for floating point tolerance
    const fits = autoCalculateSpacing ? true : (totalUsedHeight <= availableHeight + 0.01);

    // Calculate panel positions first
    let currentY = calculatedEdgeDistance;
    const panelPositions = [];
    for (let i = 0; i < panelHeights.length; i++) {
      const panelTop = currentY;
      const panelBottom = currentY + panelHeights[i];
      panelPositions.push({ top: panelTop, bottom: panelBottom, height: panelHeights[i] });
      currentY = panelBottom + calculatedPanelGap;
    }

    // Auto-calculate peephole position if enabled
    let actualPeepholeTop = peepholeTop;
    let peepholeInGap = false;
    if (showPeephole && autoCenterPeephole) {
      const idealHeight = doorHeight - 162.5; // 145-180cm from bottom, aim for 162.5 (middle)
      const peepholeRadius = peepholeDiameter / 2;

      // Find best position (centered in gap or panel)
      let bestPosition = idealHeight;
      let bestScore = Infinity;
      let bestInGap = false;

      // Check gaps between panels
      const gapCandidates = [];
      for (let i = 0; i < panelPositions.length - 1; i++) {
        const gapTop = panelPositions[i].bottom;
        const gapBottom = panelPositions[i + 1].top;
        const gapCenter = (gapTop + gapBottom) / 2;
        const score = Math.abs(gapCenter - idealHeight);

        // Ensure peephole fits in gap with minimum edge distance from both panel edges
        if (gapCenter - peepholeRadius >= gapTop + minEdgeDistance &&
            gapCenter + peepholeRadius <= gapBottom - minEdgeDistance) {
          gapCandidates.push({ position: gapCenter - peepholeRadius, score, inGap: true });
        }
      }

      // Check inside panels
      const panelCandidates = [];
      for (let i = 0; i < panelPositions.length; i++) {
        const panelCenter = (panelPositions[i].top + panelPositions[i].bottom) / 2;
        const score = Math.abs(panelCenter - idealHeight);

        // Ensure peephole fits with min edge distance from panel edges
        if (panelCenter - peepholeRadius >= panelPositions[i].top + minEdgeDistance &&
            panelCenter + peepholeRadius <= panelPositions[i].bottom - minEdgeDistance) {
          panelCandidates.push({ position: panelCenter - peepholeRadius, score, inGap: false });
        }
      }

      // Prioritize based on preference
      if (preferGapPlacement) {
        // Strongly prefer gaps: only use panels if no gaps available
        if (gapCandidates.length > 0) {
          // Choose the gap closest to ideal height
          const best = gapCandidates.reduce((prev, curr) =>
            curr.score < prev.score ? curr : prev
          );
          bestPosition = best.position;
          peepholeInGap = true;
        } else if (panelCandidates.length > 0) {
          // No gaps available, fall back to panels
          const best = panelCandidates.reduce((prev, curr) =>
            curr.score < prev.score ? curr : prev
          );
          bestPosition = best.position;
          peepholeInGap = false;
        }
      } else {
        // Default: prefer panels over gaps (only use gaps if no panels available)
        if (panelCandidates.length > 0) {
          // Choose the panel closest to ideal height
          const best = panelCandidates.reduce((prev, curr) =>
            curr.score < prev.score ? curr : prev
          );
          bestPosition = best.position;
          peepholeInGap = false;
        } else if (gapCandidates.length > 0) {
          // No panels available, fall back to gaps
          const best = gapCandidates.reduce((prev, curr) =>
            curr.score < prev.score ? curr : prev
          );
          bestPosition = best.position;
          peepholeInGap = true;
        }
      }

      actualPeepholeTop = bestPosition;
    }

    // Calculate peephole conflicts
    const peepholeConflicts = [];
    let peepholeCoordinates = null;
    let peepholeGapStatus = null;

    if (showPeephole) {
      const peepholeRadius = peepholeDiameter / 2;
      const peepholeCenter = actualPeepholeTop + peepholeRadius;
      const peepholeBottom = actualPeepholeTop + peepholeDiameter;

      // Coordinates relative to door (from bottom-left)
      peepholeCoordinates = {
        fromLeft: doorWidth / 2, // Centered horizontally
        fromBottom: doorHeight - peepholeCenter,
        fromTop: peepholeCenter,
        centerY: peepholeCenter
      };

      for (let i = 0; i < panelPositions.length; i++) {
        const panelTop = panelPositions[i].top;
        const panelBottom = panelPositions[i].bottom;

        let conflict = null;

        // Check if peephole is inside this panel
        if (peepholeCenter >= panelTop && peepholeCenter <= panelBottom) {
          const distFromTop = peepholeCenter - peepholeRadius - panelTop;
          const distFromBottom = panelBottom - (peepholeCenter + peepholeRadius);
          const minDist = Math.min(distFromTop, distFromBottom);

          if (minDist < minEdgeDistance) {
            conflict = {
              type: 'too-close-to-edge',
              distance: minDist,
              message: `Peephole edge is ${minDist.toFixed(1)}cm from panel edge (minimum ${minEdgeDistance}cm recommended)`
            };
          } else {
            conflict = {
              type: 'inside-safe',
              distance: minDist,
              message: `Safely positioned ${minDist.toFixed(1)}cm from nearest panel edge`
            };
          }
        }
        // Check if peephole crosses panel boundary
        else if ((actualPeepholeTop < panelBottom && peepholeBottom > panelTop)) {
          const distFromTop = Math.abs(peepholeCenter - panelTop);
          const distFromBottom = Math.abs(peepholeCenter - panelBottom);
          const minDist = Math.min(distFromTop, distFromBottom);
          conflict = {
            type: 'crosses-edge',
            distance: minDist,
            message: `Peephole crosses panel boundary - ${minDist.toFixed(1)}cm from edge`
          };
        }

        peepholeConflicts.push(conflict);
      }

      // Check if peephole is in a gap between panels
      for (let i = 0; i < panelPositions.length - 1; i++) {
        const gapTop = panelPositions[i].bottom;
        const gapBottom = panelPositions[i + 1].top;

        if (peepholeCenter > gapTop && peepholeCenter < gapBottom) {
          const distFromTopPanel = actualPeepholeTop - gapTop;
          const distFromBottomPanel = gapBottom - peepholeBottom;
          const minDist = Math.min(distFromTopPanel, distFromBottomPanel);

          if (minDist < minEdgeDistance) {
            peepholeGapStatus = {
              type: 'gap-too-close',
              distance: minDist,
              message: `Peephole in gap is ${minDist.toFixed(1)}cm from panel edge (minimum ${minEdgeDistance}cm recommended)`
            };
          } else {
            peepholeGapStatus = {
              type: 'gap-safe',
              distance: minDist,
              message: `Safely positioned in gap, ${minDist.toFixed(1)}cm from nearest panel edge`
            };
          }
          break;
        }
      }
    }

    // Calculate areas for verification
    const totalDoorArea = doorWidth * doorHeight;
    const totalPanelArea = panelHeights.reduce((sum, h) => sum + h * panelWidth, 0);

    // Negative space = total door area - panel area
    const negativeSpaceArea = totalDoorArea - totalPanelArea;

    // Calculate the ratio: should match targetRatio when auto-calculate is enabled
    const actualRatio = totalPanelArea / negativeSpaceArea;
    const ratioError = Math.abs(actualRatio - targetRatio) / targetRatio * 100; // Error percentage

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
      peepholeGapStatus,
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
      remainingNegativeSpace,
      targetRatio,
      peepholeCoordinates,
      actualPeepholeTop,
      peepholeInGap
    };
  }, [doorWidth, doorHeight, edgeDistance, panelGap, panelCount, proportionType, showPeephole, peepholeTop, peepholeDiameter, minEdgeDistance, autoCenterPeephole, preferGapPlacement, autoCalculateSpacing, spacingRatioType]);

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

            <div className="mt-4 bg-blue-50 p-4 rounded border border-blue-200">
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id="autoCalculateSpacing"
                  checked={autoCalculateSpacing}
                  onChange={(e) => setAutoCalculateSpacing(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="autoCalculateSpacing" className="text-sm font-medium">
                  Auto-calculate spacing using proportional ratios
                </label>
              </div>

              {autoCalculateSpacing && (
                <div className="ml-6 mb-3">
                  <label className="block text-sm font-medium mb-2">Ratio Type:</label>
                  <select
                    value={spacingRatioType}
                    onChange={(e) => setSpacingRatioType(e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    {Object.entries(ratioTypes).map(([key, ratio]) => (
                      <option key={key} value={key}>
                        {ratio.name} (≈{ratio.value.toFixed(3)})
                      </option>
                    ))}
                  </select>

                  <div className="mt-2 p-3 bg-white rounded border border-blue-200 text-xs">
                    <p className="font-medium text-blue-900 mb-1">{ratioTypes[spacingRatioType].name}</p>
                    <p className="text-gray-700 mb-2">{ratioTypes[spacingRatioType].description}</p>
                    <p className="text-blue-700 italic">💡 {ratioTypes[spacingRatioType].usage}</p>
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-600 ml-6">
                Automatically determines edge distance and panel gaps to achieve selected proportional ratio for the entire door layout
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
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="autoCenterPeephole"
                        checked={autoCenterPeephole}
                        onChange={(e) => setAutoCenterPeephole(e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor="autoCenterPeephole" className="text-sm font-medium">
                        Auto-center peephole (optimal height: 145-180cm from bottom)
                      </label>
                    </div>

                    {autoCenterPeephole && (
                      <div className="ml-6">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="preferGapPlacement"
                            checked={preferGapPlacement}
                            onChange={(e) => setPreferGapPlacement(e.target.checked)}
                            className="mr-2"
                          />
                          <label htmlFor="preferGapPlacement" className="text-xs text-gray-700">
                            Prioritize placement between panels (gaps) over inside panels
                          </label>
                        </div>
                        <div className="ml-6 mt-1 text-xs text-gray-500 italic">
                          {preferGapPlacement
                            ? '→ Will always prefer gaps over panels (only uses panels if no gaps fit)'
                            : '→ Will prefer panels over gaps (only uses gaps if no panels fit)'}
                        </div>
                      </div>
                    )}

                    {autoCenterPeephole && calculations.peepholeInGap !== undefined && (
                      <div className="ml-6 mt-2 text-xs font-medium">
                        <span className={calculations.peepholeInGap ? 'text-green-700' : 'text-blue-700'}>
                          📍 Auto-positioned {calculations.peepholeInGap ? 'between panels (in gap)' : 'inside a panel'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Distance from Top (cm)</label>
                      <input
                        type="number"
                        value={autoCenterPeephole ? calculations.actualPeepholeTop.toFixed(1) : peepholeTop}
                        onChange={(e) => setPeepholeTop(Number(e.target.value))}
                        disabled={autoCenterPeephole}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Diameter (cm)</label>
                      <input
                        type="number"
                        value={peepholeDiameter}
                        onChange={(e) => setPeepholeDiameter(Number(e.target.value))}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Min Edge Distance (cm)</label>
                      <input
                        type="number"
                        value={minEdgeDistance}
                        onChange={(e) => setMinEdgeDistance(Number(e.target.value))}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {calculations.peepholeCoordinates && (
                    <div className="bg-blue-50 p-3 rounded text-sm">
                      <p className="font-medium mb-1">Peephole Position:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <p>• From bottom: {calculations.peepholeCoordinates.fromBottom.toFixed(1)} cm</p>
                        <p>• From top: {calculations.peepholeCoordinates.fromTop.toFixed(1)} cm</p>
                        <p>• From left: {calculations.peepholeCoordinates.fromLeft.toFixed(1)} cm (centered)</p>
                        <p>• Diameter: {peepholeDiameter} cm</p>
                      </div>

                      {calculations.peepholeGapStatus && (
                        <div className={`mt-2 p-2 rounded border text-xs ${
                          calculations.peepholeGapStatus.type === 'gap-safe'
                            ? 'bg-green-50 border-green-300 text-green-800'
                            : 'bg-yellow-50 border-yellow-300 text-yellow-800'
                        }`}>
                          <p className="font-medium">
                            {calculations.peepholeGapStatus.type === 'gap-safe' ? '✓ Gap Placement Safe' : '⚠ Gap Placement Warning'}
                          </p>
                          <p className="mt-1">{calculations.peepholeGapStatus.message}</p>
                        </div>
                      )}
                    </div>
                  )}
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
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          calculations.peepholeConflicts[index].type === 'inside-safe' ? 'bg-green-100 text-green-700' :
                          calculations.peepholeConflicts[index].type === 'too-close-to-edge' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}
                        title={calculations.peepholeConflicts[index].message}
                      >
                        {calculations.peepholeConflicts[index].type === 'inside-safe' ? '✓ Safe' :
                         calculations.peepholeConflicts[index].type === 'too-close-to-edge' ? '⚠ Too close' :
                         '✗ Crosses edge'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <p><strong>Golden ratio (φ):</strong> {calculations.phi.toFixed(4)}</p>
              <p><strong>Total used height:</strong> {calculations.totalUsedHeight.toFixed(1)} / {calculations.availableHeight.toFixed(1)} cm</p>
              {!autoCalculateSpacing && (
                calculations.fits ?
                  <p className="text-green-600 font-medium">✓ All panels fit perfectly</p> :
                  <p className="text-red-600 font-medium">⚠️ Panels don't fit - reduce panel count or gaps</p>
              )}
              {autoCalculateSpacing && (
                <p className="text-blue-600 font-medium">ℹ️ Spacing auto-calculated to fit panels</p>
              )}

              {/* Peephole status in Panel Specifications */}
              {showPeephole && calculations.peepholeConflicts.some(c => c !== null) && (
                <div className="mt-4 pt-3 border-t border-blue-200">
                  <p className="font-medium mb-2">Peephole Status:</p>
                  {calculations.peepholeConflicts.map((conflict, index) => conflict && (
                    <div key={index} className={`text-xs px-3 py-2 rounded mb-2 ${
                      conflict.type === 'inside-safe' ? 'bg-green-100 text-green-800' :
                      conflict.type === 'too-close-to-edge' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      <span className="font-medium">Panel {index + 1}: </span>
                      {conflict.message}
                    </div>
                  ))}
                  {calculations.peepholeGapStatus && (
                    <div className={`text-xs px-3 py-2 rounded ${
                      calculations.peepholeGapStatus.type === 'gap-safe'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      <span className="font-medium">Gap: </span>
                      {calculations.peepholeGapStatus.message}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {autoCalculateSpacing && (
            <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200">
              <h2 className="text-xl font-semibold mb-4 text-purple-900">
                {ratioTypes[spacingRatioType].name} Verification
              </h2>
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
                  <p className="font-medium mb-2">Ratio Verification:</p>
                  <p className="ml-4">• Target ratio: {calculations.targetRatio.toFixed(6)}</p>
                  <p className="ml-4">• Actual ratio (Panel/Negative): {calculations.actualRatio.toFixed(6)}</p>
                  <p className={`ml-4 font-medium ${calculations.ratioError < 1 ? 'text-green-600' : calculations.ratioError < 5 ? 'text-yellow-600' : 'text-red-600'}`}>
                    • Error: {calculations.ratioError.toFixed(2)}%
                    {calculations.ratioError < 1 ? ' ✓ Excellent!' : calculations.ratioError < 5 ? ' ⚠ Close' : ' ✗ Needs adjustment'}
                  </p>
                </div>

                <div className="bg-purple-100 p-3 rounded">
                  <p className="text-xs text-purple-900">
                    <strong>Note:</strong> When auto-calculate is enabled, the panel area should be {calculations.targetRatio.toFixed(3)}× the negative space area, creating harmonious {ratioTypes[spacingRatioType].name.toLowerCase()} proportions for the entire door.
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

              {/* Peephole target zone (145-180cm from bottom) */}
              {showPeephole && (
                <g>
                  {/* Lower bound (180cm from bottom = doorHeight - 180) */}
                  <line
                    x1={20}
                    y1={20 + (doorHeight - 180) * scale}
                    x2={20 + scaledDoorWidth}
                    y2={20 + (doorHeight - 180) * scale}
                    stroke="#4A90E2"
                    strokeWidth="1.5"
                    strokeDasharray="8,4"
                    opacity="0.6"
                  />
                  <text
                    x={20 + scaledDoorWidth + 5}
                    y={20 + (doorHeight - 180) * scale}
                    fontSize="9"
                    fill="#4A90E2"
                    dominantBaseline="middle"
                  >
                    180cm
                  </text>

                  {/* Upper bound (145cm from bottom = doorHeight - 145) */}
                  <line
                    x1={20}
                    y1={20 + (doorHeight - 145) * scale}
                    x2={20 + scaledDoorWidth}
                    y2={20 + (doorHeight - 145) * scale}
                    stroke="#4A90E2"
                    strokeWidth="1.5"
                    strokeDasharray="8,4"
                    opacity="0.6"
                  />
                  <text
                    x={20 + scaledDoorWidth + 5}
                    y={20 + (doorHeight - 145) * scale}
                    fontSize="9"
                    fill="#4A90E2"
                    dominantBaseline="middle"
                  >
                    145cm
                  </text>

                  {/* Target zone shading */}
                  <rect
                    x={20}
                    y={20 + (doorHeight - 180) * scale}
                    width={scaledDoorWidth}
                    height={(180 - 145) * scale}
                    fill="#4A90E2"
                    opacity="0.08"
                  />

                  {/* Label for target zone */}
                  <text
                    x={25}
                    y={20 + (doorHeight - 162.5) * scale}
                    fontSize="10"
                    fill="#4A90E2"
                    fontWeight="bold"
                    opacity="0.7"
                  >
                    Optimal Peephole Zone
                  </text>
                </g>
              )}

              {/* Panels */}
              {(autoCalculateSpacing || calculations.fits) && calculations.panelHeights.map((height, index) => {
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
                  {/* Peephole cutout - rendered as circle */}
                  <circle
                    cx={20 + (doorWidth / 2) * scale} // Centered horizontally
                    cy={20 + (calculations.actualPeepholeTop + peepholeDiameter/2) * scale}
                    r={(peepholeDiameter / 2) * scale}
                    fill="#000"
                    stroke="#666"
                    strokeWidth="1.5"
                  />
                  {/* Peephole label */}
                  <text
                    x={20 + (doorWidth / 2 + peepholeDiameter/2 + 2) * scale}
                    y={20 + (calculations.actualPeepholeTop + peepholeDiameter/2) * scale}
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