export function GET() {
  return new Response(null, { status: 404 });
}

export { GET as POST, GET as PUT, GET as PATCH, GET as DELETE, GET as OPTIONS };
