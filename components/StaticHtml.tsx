/* Renders one of the approved static design sections (home hero, about, blog
   listing, policies) exactly as it was. The HTML comes from files in /content that
   are part of this project — never from customers — so it is safe to insert. */
export default function StaticHtml({ html, as: Tag = 'div', className }: { html: string; as?: any; className?: string }) {
  return <Tag className={className} style={className ? undefined : { display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />;
}
