using System.Collections;
using Core.Entities;
using Core.Interfaces;

namespace Infrastructure.Data
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly StoreContext _context;
        private Hashtable _repositories;

        public UnitOfWork(StoreContext context)
        {
            _context = context;
        }

        public async Task<int> Complete()
        {
            return await _context.SaveChangesAsync();
        }

        public async Task Rollback()
        {
            await _context.DisposeAsync();
        }

        public void Dispose()
        {
            _context.Dispose();
        }

        public IGenericRepository<TEntity> Repository<TEntity>() where TEntity : BaseEntity
        {
            if (_repositories == null) _repositories = new Hashtable();

            // could be of type product for example
            var type = typeof(TEntity).Name;

            if (!_repositories.ContainsKey(type))
            {
                var repositoryType = typeof(GenericRepository<>);
                var repositoryInstance = Activator.CreateInstance(repositoryType.MakeGenericType(typeof(TEntity)), _context);

                // add all repos in use into our hashtable inside UoW
                _repositories.Add(type, repositoryInstance);
            }

            // querying the entry in the _repo table, hence square brackets
            return (IGenericRepository<TEntity>)_repositories[type];
        }
    }
}