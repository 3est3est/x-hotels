# 02: Catalog — Region, Hotel, Room Type

**What to build:** An anonymous Guest can browse the X Hotel group's catalog over HTTP: list Regions, search/list Hotels filtered by Region and free-text query, and open a Hotel's detail with its Room Types. A seed script fills the catalog with fake Hotels and demo images so the API is demonstrable without real data. Search results contain only X Hotel group Hotels.

**Blocked by:** 01 (Scaffold + DB tracer bullet)

**Status:** ready-for-agent

- [ ] Catalog schema: Region (unique name), Hotel (name, description, image refs, Region FK), Room Type (name, description, max guest capacity, image refs, Hotel FK)
- [ ] Seed script populates fake Regions → Hotels → Room Types with demo image URLs
- [ ] `GET /regions` lists all Regions
- [ ] `GET /hotels?regionId=&q=` lists Hotels with filter/search
- [ ] `GET /hotels/:id` returns Hotel detail including its Room Types
- [ ] Tests: catalog reads return seeded data; unknown Hotel id → 404
