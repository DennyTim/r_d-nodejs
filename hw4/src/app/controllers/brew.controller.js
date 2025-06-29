export class BrewController {
  static scope = "scoped";

  constructor(brewService) {
    this.brewService = brewService;
  }

  index = (req, res) => {
    const { method, ratingMin } = req.queryParams;
    return res.json(this.brewService.getAll(method, ratingMin));
  };

  show = (req, res) => {
    return res.json(this.brewService.getOne(req.params.id));
  };

  create = (req, res) => {
    return res
      .status(201)
      .json(this.brewService.create(req.body));
  };

  update = (req, res) => {
    return res.json(this.brewService.update(req.params.id, req.body));
  };

  remove = (req, res) => {
    this.brewService.delete(req.params.id);
    res.status(204).end();
  };
}
