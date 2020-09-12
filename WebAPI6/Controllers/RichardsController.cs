using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Description;
using WebAPI6.Models;
using System.Web.Http.Cors;

namespace WebAPI6.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class RichardsController : ApiController
    {
        private NorthwindEntities db = new NorthwindEntities();

        // GET: api/Richards
        public IQueryable<Richard> GetRichard()
        {
            return db.Richard;
        }

        // GET: api/Richards/5
        [ResponseType(typeof(Richard))]
        public IHttpActionResult GetRichard(int id)
        {
            Richard richard = db.Richard.Find(id);
            if (richard == null)
            {
                return NotFound();
            }

            return Ok(richard);
        }

        // PUT: api/Richards/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutRichard(int id, Richard richard)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != richard.ID)
            {
                return BadRequest();
            }

            db.Entry(richard).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RichardExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return StatusCode(HttpStatusCode.NoContent);
        }

        // POST: api/Richards
        [ResponseType(typeof(RootObject))]
        public IHttpActionResult PostRichard(RootObject ro)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            foreach (var r in ro.excel)
            {
                db.Richard.Add(r);
                db.SaveChanges();
            }

            return CreatedAtRoute("DefaultApi", new { id = Guid.NewGuid()},ro);            
        }

        // DELETE: api/Richards/5
        [ResponseType(typeof(Richard))]
        public IHttpActionResult DeleteRichard(int id)
        {
            Richard richard = db.Richard.Find(id);
            if (richard == null)
            {
                return NotFound();
            }

            db.Richard.Remove(richard);
            db.SaveChanges();

            return Ok(richard);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool RichardExists(int id)
        {
            return db.Richard.Count(e => e.ID == id) > 0;
        }
    }
}