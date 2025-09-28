type Props = { params: { handle: string } };
export default function Storefront({ params }: Props) {
  return <h1>Storefront for @{params.handle}</h1>;
}
