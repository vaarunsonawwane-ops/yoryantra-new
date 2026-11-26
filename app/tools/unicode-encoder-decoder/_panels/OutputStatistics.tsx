export default function OutputStatistics({ idPrefix, title, description, items }: {
  idPrefix: string;
  title: string;
  description?: string;
  items: ReadonlyArray<readonly [string, string]>;
}) {
  const split = Math.ceil(items.length / 2);
  const labelClass = "break-words px-3 py-2 text-left font-medium";
  const valueClass = "break-words px-3 py-2 text-center tabular-nums";
  const headerClass = "px-3 py-2 font-semibold";
  return (
    <div className="mt-4 min-w-0">
      <h4 id={`${idPrefix}-title`} className="text-sm font-semibold text-gray-900">{title}</h4>
      {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
      <div className="mt-2 overflow-hidden rounded-xl border border-gray-200">
        <table aria-labelledby={`${idPrefix}-title`} className="hidden w-full table-fixed border-collapse text-sm text-gray-900 md:table">
          <colgroup><col className="w-[35%]"/><col className="w-[15%]"/><col className="w-[35%]"/><col className="w-[15%]"/></colgroup>
          <thead className="bg-gray-50 text-gray-900">
            <tr>
              <th scope="col" className={`${headerClass} text-left`}>Metric</th>
              <th scope="col" id={`${idPrefix}-left-value`} className={`${headerClass} text-center`}>Value</th>
              <th scope="col" className={`${headerClass} text-left`}>Metric</th>
              <th scope="col" id={`${idPrefix}-right-value`} className={`${headerClass} text-center`}>Value</th>
            </tr>
          </thead>
          <tbody>
            {items.slice(0, split).map(([label, value], i) => {
              const other = items[i + split];
              return <tr key={label} className="border-t border-gray-200">
                <th id={`${idPrefix}-row-${i}`} className={labelClass}>{label}</th>
                <td headers={`${idPrefix}-row-${i} ${idPrefix}-left-value`} className={valueClass}>{value}</td>
                {other ? <>
                  <th id={`${idPrefix}-row-${i + split}`} className={labelClass}>{other[0]}</th>
                  <td headers={`${idPrefix}-row-${i + split} ${idPrefix}-right-value`} className={valueClass}>{other[1]}</td>
                </> : <td colSpan={2}/>}
              </tr>;
            })}
          </tbody>
        </table>
        <table aria-labelledby={`${idPrefix}-title`} className="w-full table-fixed border-collapse text-sm text-gray-900 md:hidden">
          <colgroup><col className="w-[65%]"/><col className="w-[35%]"/></colgroup>
          <thead className="bg-gray-50 text-gray-900"><tr><th scope="col" className={`${headerClass} text-left`}>Metric</th><th scope="col" className={`${headerClass} text-center`}>Value</th></tr></thead>
          <tbody>{items.map(([label, value]) => <tr key={label} className="border-t border-gray-200"><th scope="row" className={labelClass}>{label}</th><td className={valueClass}>{value}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
