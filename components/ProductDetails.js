// Descrição + atributos da categoria (Material, Fechamento, Gênero alvo...) vindos da Shopify
export default function ProductDetails({ descriptionHtml, attributes }) {
  const blocks = attributes.filter((a) => a.block);
  const specs = attributes.filter((a) => !a.block);

  return (
    <div className="acc">
      {descriptionHtml?.trim() && (
        <details open>
          <summary>Descrição</summary>
          <div className="prose" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
        </details>
      )}

      {specs.length > 0 && (
        <details open>
          <summary>Detalhes do produto</summary>
          <dl className="specs">
            {specs.map((a) => (
              <div className="spec" key={a.label}>
                <dt>{a.label}</dt>
                <dd>
                  {a.values.length === 1 && a.values[0].length > 40 ? (
                    <p>{a.values[0]}</p>
                  ) : (
                    <ul className="chips">
                      {a.values.map((v) => <li key={v}>{v}</li>)}
                    </ul>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </details>
      )}

      {blocks.map((a) => (
        <details key={a.label}>
          <summary>{a.label}</summary>
          {a.values.map((v) => <p className="prose" key={v}>{v}</p>)}
        </details>
      ))}
    </div>
  );
}
