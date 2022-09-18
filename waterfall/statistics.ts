export function getWaterfallStatistics<Ele extends HTMLElement = HTMLElement>(
  wrapperEle,
  options
) {
  return getStatistics<Ele>(wrapperEle, options);
}

/**
 *
 * @param wrapperEle HTMLElement
 * @param options { gap: number, columns: number }
 * @returns { 
 *      itemWidth: number,
 *      wrapperWidth: number,
 *      gapWidth: number,
 *      columns: number,
 *      gap: number,
 *      gapNum: number
 * }
 */
export function getStatistics<Ele extends HTMLElement = HTMLElement>(
  wrapperEle: Ele,
  options
) {
  const wrapperEleOffsetWidth = wrapperEle?.offsetWidth || 0;
  const { gap = 0, columns = 1 } = options || {};
  /**
   *
   */
  const gapWidth = gap * (columns - 1);

  /**
   *
   */
  const itemWidth = (wrapperEleOffsetWidth - gapWidth) / columns;

  return {
    itemWidth,
    wrapperWidth: wrapperEleOffsetWidth,
    gapWidth,
    columns,
    gap,
    gapNum: columns - 1,
  };
}
